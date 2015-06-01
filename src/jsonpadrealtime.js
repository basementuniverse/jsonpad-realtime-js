var jsonpadRealtime = (function() {
	
	// The realtime API base URL
	var BASE_URL = "http://realtime.jsonpad.io/";
	
	// Return a unique randomly generated id
	var uid = function() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	};
	
	// Send a GET request to the specified URL and callback when a response is received
	var connect = function(username, token, url, success, error) {
		var xhr = null;
		
		// Get XMLHttp instance
		if (window.XMLHttpRequest) {		// Normal browsers
			xhr = new XMLHttpRequest();
		} else if (window.ActiveXObject) {	// IE
			try {
				xhr = new ActiveXObject("Msxml2.XMLHTTP");
			} catch (e) {
				try {
					xhr = new ActiveXObject("Microsoft.XMLHTTP");
				} catch (e) { }
			}
		}
		
		// Couldn't get an XMLHttp instance
		if (!xhr) {
			error({
				message: "Couldn't get XMLHttp instance."
			});
			return;
		}
		
		// Otherwise, send the request
		xhr.open("GET", BASE_URL + url);
		xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + token));
		xhr.onreadystatechange = function(data) {
			if (xhr.readyState === 4) {
				
				// Parse response data as JSON
				var responseData = null;
				try {
					responseData = JSON.parse(xhr.responseText);
				} catch (e) { }
				
				// Only call success for 200 OK responses, everything else is considered an error
				if (xhr.status === 200) {
					success(responseData);
				} else {
					error(responseData);
				}
			}
		};
		xhr.send();
	};
	
	return {
		username: "",
		token: "",
		
		/**
		* Create a new instance of the jsonpad Realtime API connector
		*
		* @param {string} username Your account username
		* @param {string} token Your account's realtime token
		*
		* @return {Object} The API connector instance
		*/
		create: function(username, token) {
			var j = Object.create(this);
			j.username = username;
			j.token = token;
			return j;
		},
		
		/**
		* Callback for handling a resource event
		*
		* @callback eventCallback
		* @param {string} objectId The id or name of the object affected by the event (if the
		*	object is a list this will be the list's name, otherwise if it's an item then this
		*	will be the item's id
		* @param {?Object} eventData The data returned by the event, or null if there is no data
		* @param {string} eventType The type of event that occurred
		*/
		
		/**
		* Watch all lists for events and callback when an event is detected
		*
		* @param {eventCallback} callback A function for handling events
		* @param {string[]} [events] An optional list of event names to watch for
		*/
		watch: function(callback, events) {
			var self = this;
			
			// Get a unique id for the connection
			var id = uid();
			
			// Prepare the events parameter if any event types are specified
			var eventsParameter = "";
			if (events instanceof Array && events.length > 0) {
				eventsParameter = "&events=" + events.join(",");
			}
			
			// Open a repeating connection to the realtime API
			(function repeatConnect() {
				connect(
					self.username,
					self.token,
					"lists?_=" + id + eventsParameter,
					function(responseData) {
						if (responseData["event_type"] != "timeout") {
							callback(
								responseData["object_id"],
								responseData["event_data"],
								responseData["event_type"]
							);
						}
						repeatConnect();
					},
					function(responseData) {
						console.log("An error occurred: %O", responseData);
					}
				);
			}());
		},
		
		/**
		* Watch a particular list for events and callback when an event is detected
		*
		* @param {string} name The name of the list to watch
		* @param {eventCallback} callback A function for handling events
		* @param {string[]} [events] An optional list of event names to watch for
		*/
		watchList: function(name, callback, events) {
			var self = this;
			
			// Get a unique id for the connection
			var id = uid();
			
			// Prepare the events parameter if any event types are specified
			var eventsParameter = "";
			if (events instanceof Array && events.length > 0) {
				eventsParameter = "&events=" + events.join(",");
			}
			
			// Open a repeating connection to the realtime API
			(function repeatConnect() {
				connect(
					self.username,
					self.token,
					"lists/" + name + "?_=" + id + eventsParameter,
					function(responseData) {
						if (responseData["event_type"] != "timeout") {
							callback(
								responseData["object_id"],
								responseData["event_data"],
								responseData["event_type"]
							);
						}
						
						// If the list was updated, change the name of the list being watched,
						// otherwise the next connection will cause a 'list not found' exception
						if (responseData["event_type"] == "list-update") {
							name = responseData["event_data"]["name"];
						}
						
						// If the list was deleted or if all lists were deleted, stop watching
						if (
							responseData["event_type"] != "list-delete" &&
							responseData["event_type"] != "list-delete-all"
						) {
							repeatConnect();
						}
					},
					function(responseData) {
						console.log("An error occurred: %O", responseData);
					}
				);
			}());
		},
		
		/**
		* Watch a particular item for events and callback when an event is detected
		*
		* @param {string} id The id of the item to watch
		* @param {eventCallback} callback A function for handling events
		* @param {string[]} [events] An optional list of event names to watch for
		*/
		watchItem: function(id, callback, events) {
			var self = this;
			
			// Get a unique id for the connection
			var connectionId = uid();
			
			// Prepare the events parameter if any event types are specified
			var eventsParameter = "";
			if (events instanceof Array && events.length > 0) {
				eventsParameter = "&events=" + events.join(",");
			}
			
			// Open a repeating connection to the realtime API
			(function repeatConnect() {
				connect(
					self.username,
					self.token,
					"items/" + id + "?_=" + connectionId + eventsParameter,
					function(responseData) {
						if (responseData["event_type"] != "timeout") {
							callback(
								responseData["object_id"],
								responseData["event_data"],
								responseData["event_type"]
							);
						}
						
						// If the item was deleted, or if all items in the list were deleted, or if
						// the list containing the item was deleted, or if all lists were deleted,
						// then stop watching
						if (
							responseData["event_type"] != "item-delete" &&
							responseData["event_type"] != "item-delete-all" &&
							responseData["event_type"] != "list-delete" &&
							responseData["event_type"] != "list-delete-all"
						) {
							repeatConnect();
						}
					},
					function(responseData) {
						console.log("An error occurred: %O", responseData);
					}
				);
			}());
		}
	};
}());