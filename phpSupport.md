# PHP Support

## Sending

When  a user send a bullet screen, YangPlayer will send data that contains following properties to server asynchronously:

### fontSize

#### `string` `required`

Three types: '1em'(little), '1.5em'(middle), '2em'(big)

### userId

#### `string` `required`

Distinguish different user, default is using `Date.now()`

### mode

#### `string` `required`

Two types: 'top', 'move'

### color

#### `string` `required`

A hex color value

### message

#### `string` `required`

The message user inputed

Note: You should filter the message on server side.

### playTime

#### `number` `required`

The player currentTime when user sent the message

### date

#### `string` `required`

The date when user sent the message

### videoId

#### `string` `optional`

Distinguish different video

## Returning

The server side should return a json data containing fontSize, userId, mode, color, message, playTime and date.

See [simple php demo](https://github.com/yangkean/YangPlayer/blob/master/demo/demo.php) here.

Also, you can hack the ajax method in YangPlayer to meet your need.
