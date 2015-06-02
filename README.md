# jsonpad Realtime API connector

This is a Javascript connector for the [jsonpad](https://jsonpad.io) Realtime API, which allows you to get realtime updates when lists and items change.

See the [jsonpad Realtime API Documentation](https://jsonpad.io/docs-realtime) for more information on the jsonpad Realtime API.

## Installation

To install this script manually, just download the [latest release](https://github.com/basementuniverse/jsonpad-realtime-js/releases).

Then, include the `jsonpadrealtime.js` file in your page:

	<script src="jsonpad-realtime-js/src/jsonpadrealtime.js"></script>

## Getting started

Here's an example of how to get started:

	var jsonpad = jsonpadRealtime.create("username", "realtimetoken");
	
	// Watch all events
	jsonpad.watch(function(objectId, eventData, eventType) {
		console.log(
			"An event occurred! Object ID: %s\nEvent data: %O\nEvent type: %s",
			objectId,
			eventData,
			eventType
		);
	});
	
	// Watch a particular list for events (and filter events for "list-update" only)
	jsonpad.watchList(
		"listname",
		function(objectId, eventData, eventType) {
			// ...
		},
		["list-update"]
	);
	
	// Watch a particular item for events (and filter events for "list-delete" or
	// "item-delete" only)
	jsonpad.watchItem(
		"itemid",
		function(objectId, eventData, eventType) {
			// ...
		},
		["list-delete", "item-delete"]
	);

## Documentation

The `jsonpadRealtime` object has 3 functions:

### .watch(_callback_ [, _events_])
`callback` A function that will be called when an event occurs. This function should take 3 arguments:

- `objectId` The name/id of the list/item affected by the event.
- `eventData` An object containing information associated with the event.
- `eventType` A string containing the type of event that occurred.

`events` An optional array of event types to watch for. See [jsonpad Realtime API Documentation](https://jsonpad.io/docs-realtime#Filtering-events) for a list of event types.

### .watchList(_listName_, _callback_ [, _events_])

`listName` The name of the list to watch.

`callback` A function that will be called when an event occurs on the list being watched.

`events` An optional array of event types to watch for.

### .watchItem(_itemId_, _callback_ [, _events_])

`itemId` The id of the item to watch.

`callback` A function that will be called when an event occurs on the item being watched.

`events` An optional array of event types to watch for.