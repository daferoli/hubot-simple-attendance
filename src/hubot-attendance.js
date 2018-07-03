const _ = require('lodash')
const { addDays, format } = require('date-fns')

const ATTENDANCE_PREFIX = process.env.ATTENDANCE_PREFIX || 'hubot-attendance'
const DAY_MASKS = {
  sunday:    0b1000000,
  monday:    0b0100000,
  tuesday:   0b0010000,
  wednesday: 0b0001000,
  thursday:  0b0000100,
  friday:    0b0000010,
  saturday:  0b0000001
}

module.exports = (robot) => {

  let attendance

  robot.hear(/^!attendance help$/i, (res) => {
    res.send(`
    attendance bot tracks weekly *user* attendance for a *list*

    CONCEPTS:

    each *list* has multiple *users*
    each *user* can be on multiple *lists*
    each *user* can only be on each *list* once

    *lists* have multiple *days*
    a *user* is either present (1) or absent (0) on each *day*
    *days* are represented by a list of 7 bits (one per DOW) OR 5 bits (weekdays)

    whenever a *list* is _cycled_, all *users* in that *list* are cleared

    COMMANDS:
    !attendance <list> <5/7 day bits>
      set the speaker's current weeks' attendance to the *list*

      examples:
        \`!attendance charlotte 11111\` --> weekdays
        \`!attendance charlotte 0101010\` --> MWF

    !attendance <list> [day]
      show current week's attendance for *list* (on specified day)

    !attendance cycle <list>
      cycle the *list* to the next week

    !attendance lock <list>
      locks the *list* so that only the speaker can cycle|unlock|rm the list

    !attendance unlock <list>
      unlocks the *list* (see lock)

    !attendance rm <list>
      deletes the *list* (and all *user* associations with it!)
    `)
  })

  robot.hear(/^!attendance (\w+) ([01]{5}|[01]{7})$/i, (res) => {
    const user = res.message.user.name
    const listName = res.match[1]

    let bits = res.match[2]
    let list = attendance[listName] || {}

    if(bits.length === 5) {
      bits = _.pad(bits, 7, '0')
    }
    list[user] = bits
    
    attendance[listName] = list
    res.send(`set ${user} to ${bits} in ${listName}`)
    flush()
  })

  robot.hear(/^!attendance (\w+) ?(sunday|monday|tuesday|wednesday|thursday|friday|saturday|today|tomorrow)?$/i, (res) => {
    const listName = res.match[1]
    const day = res.match[2]
    const list = attendance[listName]

    if (!list) {
      res.send('list does not exist')
      return
    }

    let out = `${listName} attendance:\n`
    if (day) {
      out += formatDay(list, day)
    } else {
      _.each(_.keys(DAY_MASKS), day => out += `${formatDay(list, day)}\n`)
    }
    res.send(out)
  })

  robot.hear(/^!attendance cycle (\w+)$/i, (res) => {
    // TODO check lock
    flush()
  })

  // TODO
  robot.hear(/^!attendance lock (\w+)$/i, (res) => {
    flush()
  })

  // TODO
  robot.hear(/^!attendance unlock (\w+)$/i, (res) => {
    flush()
  })

  robot.hear(/^!attendance rm (\w+)$/i, (res) => {
    // TODO check lock
    delete attendance[res.match[1]]
    flush()
  })

  function formatDay(list, dayName) {
    const users = getUsersForDay(list, dayName)
    if(users.length) {
      let out = `${_.capitalize(dayName)}:\n`
      _.each(getUsersForDay(list, dayName), user => out += `  ${user}\n`)
      return out
    } else {
      return ''
    }
  }

  function getDayMask(dayName) {
    if(dayName === 'today') {
      dayName = format(new Date(), 'dddd')
      (new Date()).getDay()
    } else if(dayName === 'tomorrow') {
      dayName = format(addDays(new Date(), 1), 'dddd')
    }
    return DAY_MASKS[dayName]
  }

  function getUsersForDay(list, dayName) {
    return _.chain(list)
            .toPairs()
            .filter(user => ((parseInt(user[1], 2) & getDayMask(dayName)) > 0))
            .sortBy('0')
            .map(user => (user[0]))
            .value()
  }

  function flush() {
    robot.brain.set(ATTENDANCE_PREFIX, attendance)
  }

  attendance = robot.brain.get(ATTENDANCE_PREFIX)
  if (!attendance) {
    attendance = {}
    flush()
  }

}
