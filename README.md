# hubot-simple-attendance

This plugin allows hubot to track weekly *user* attendance for a *list* (e.g. who will be in an office during the week).

## Concepts

#### Lists
- Each *list* has multiple *users*
- Each *user* can be on multiple *lists*
- Each *user* can only be on each *list* once

#### Days in the week
- *Lists* have multiple *days*
- A *user* is either present (1) or absent (0) on each *day*
- *Days* are represented by a list of 7 bits (one per DOW) OR 5 bits (weekdays)

#### Administration
- Whenever a *list* is _cycled_, all *users* in that *list* are cleared (it is generally the list "owner" responsibility to do so at the end of the week).
- One user can _lock_ the list so only they can lock/unlock/cycle/rm the *list* (this makes them the "owner" of that list)

## Commands

#### Setting your bits

!attendance <list> <5/7 day bits>

Set the speaker's current weeks' attendance to the *list*. Accepts either 5 or 7 bits, with each bit representing present (1) or absent (0) for the positional day. Weeks start with Sunday.

Examples:

- \`!attendance charlotte 11111\` --> set present for all weekdays
- \`!attendance charlotte 0101010\` --> set present for MWF

#### Showing the attendance for a list

!attendance <list> [day]

Show current week's attendance for *list*. Takes an optional day, in which case it only shows the attendance for that particular day.

#### Cycling the list

!attendance cycle <list>

Cycles the *list* to the next week. Meta info (such as owner) for the list are maintained. All user attendance is cleared. This should be done by the owner/locker at the end of each week.

#### (Un)locking the list

!attendance <lock|unlock> <list>

Locks or unlocks the *list* so that only the speaker can cycle|unlock|rm the list.

#### Removing a list

!attendance rm <list>

Completely deletes the *list* (including meta info). If you just want to go to the next week, use `cycle`.
