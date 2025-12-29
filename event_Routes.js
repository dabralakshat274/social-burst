const express = require("express");
const multer = require("multer");
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  removeAttendee,
  getGroupChatByEventId,
  getGroupChatsForUser,
  addAttendee,
  followEvent,
  toggleCalendar,
  toggleEventNotification,
  toggleSaveEvent,
  unfollowEvent,
  uploadEventImage,
  getEventImages,
  attendEvent,
  getAttending,
  removeAttending,
  viewEvent,
  incrementSave,
  incrementShare,
  incrementClick,
} = require("../controllers/event_Controller");
const validateToken = require("../middleware/validateTokenHandler");
const authorizeRoles = require("../middleware/authRoles");
const { auth } = require("firebase-admin");
const router = express.Router();

// Multer setup to handle file uploads (store in memory for quick upload to S3)
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       properties:
 *         eventId:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         eventType:
 *           type: string
 *           enum: [normal, burst]
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         location:
 *           type: string
 *         latitude:
 *           type: number
 *           format: float
 *         longitude:
 *           type: number
 *           format: float
 *         visibility:
 *           type: string
 *           enum: [public, private]
 *         imagePath:
 *           type: string
 *         attendees:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/events/create:
 *   post:
 *     summary: Create a new event with optional image upload
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               eventType:
 *                 type: string
 *                 enum: [normal, burst]
 *                 description: The type of the event (normal or burst).
 *               eventCategoryId:
 *                 type: string
 *                 description: The ID of the event category.
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: The start date and time of the event.
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: The end date and time of the event.
 *               title:
 *                 type: string
 *                 description: The title of the event.
 *               description:
 *                 type: string
 *                 description: A detailed description of the event.
 *               location:
 *                 type: string
 *                 description: The location where the event will take place.
 *               latitude:
 *                 type: number
 *                 format: float
 *                 description: The latitude of the event location (optional).
 *               longitude:
 *                 type: number
 *                 format: float
 *                 description: The longitude of the event location (optional).
 *               status:
 *                 type: string
 *                 enum: [draft, published, canceled, completed]
 *                 description: The status of the event. Defaults to 'draft' if not provided.
 *               attendees:
 *                 type: string
 *                 description: A comma-separated list of user IDs invited to the event.
 *                 example: "userID1,userID2,userID3"
 *               visibility:
 *                 type: string
 *                 enum: [public, private]
 *                 default: private
 *                 description: The visibility of the event. Defaults to 'private' if not specified.
 *               image:
 *                 type: string
 *                 format: binary  # Specify that the image is a file (binary data)
 *                 description: The image associated with the event (optional).
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     eventId:
 *                       type: string
 *                       description: The ID of the event.
 *                     title:
 *                       type: string
 *                       description: The title of the event.
 *                     description:
 *                       type: string
 *                       description: The description of the event.
 *                     location:
 *                       type: string
 *                       description: The location where the event will take place.
 *                     latitude:
 *                       type: number
 *                       format: float
 *                       description: The latitude of the event location.
 *                     longitude:
 *                       type: number
 *                       format: float
 *                       description: The longitude of the event location.
 *                     locationGeo:
 *                       type: object
 *                       properties:
 *                         type:
 *                           type: string
 *                         coordinates:
 *                           type: array
 *                           items:
 *                             type: number
 *                           description: The GeoJSON location object with type and coordinates [lon, lat].
 *                     visibility:
 *                       type: string
 *                       enum: [public, private]
 *                       description: The visibility status of the event.
 *                     imagePath:
 *                       type: string
 *                       description: The URL/path of the event image (if uploaded).
 */
router.post(
  "/create",
  validateToken,
  authorizeRoles("user", "business", "admin"),
  upload.single("image"), // Handle image file upload with field name "image"
  createEvent
);

/**
 * @swagger
 * /api/events/{eventId}/follow:
 *   post:
 *     summary: Follow an event
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         description: The ID of the event to follow
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event followed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     eventId:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     followers:
 *                       type: array
 *                       items:
 *                         type: string
 *                         description: ID of the user following the event
 *       400:
 *         description: Already following the event
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error occurred
 */
router.post(
  "/:eventId/follow",
  validateToken,
  authorizeRoles("user"),
  followEvent
);

/**
 * @swagger
 * /api/events/{eventId}/unfollow:
 *   delete:
 *     summary: Unfollow an event
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         description: The ID of the event to unfollow
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event unfollowed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     eventId:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     followers:
 *                       type: array
 *                       items:
 *                         type: string
 *                         description: ID of the user following the event
 *       400:
 *         description: Not following the event
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error occurred
 */
router.delete(
  "/:eventId/unfollow",
  validateToken,
  authorizeRoles("user"),
  unfollowEvent
);

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events with optional filters, search, pagination, sorting and geo radius filtering
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         description: Filter events by status
 *         schema:
 *           type: string
 *           enum: [draft, published, canceled, completed]
 *       - in: query
 *         name: timeFilter
 *         description: Filter events by time (default is ongoing)
 *         schema:
 *           type: string
 *           enum: [current_future, ongoing, future]
 *           default: ongoing
 *       - in: query
 *         name: eventType
 *         description: Filter events by event type
 *         schema:
 *           type: string
 *           enum: [normal, burst]
 *       - in: query
 *         name: eventCategoryId
 *         description: Filter events by event category ID
 *         schema:
 *           type: string
 *       - in: query
 *         name: visibility
 *         description: Filter events by visibility
 *         schema:
 *           type: string
 *           enum: [public, private]
 *       - in: query
 *         name: location
 *         description: Search by location (partial match in the event's location string)
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         description: Filter events by specific date (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: search
 *         description: Search events by title or description
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         description: Number of items per page (max 100)
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: order
 *         description: Sort order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: orderBy
 *         description: Field to sort by
 *         schema:
 *           type: string
 *           default: createdAt
 *       # ---------- GEO / radius params ----------
 *       - in: query
 *         name: location_id
 *         description: ID of a saved address (use saved location as center). If provided, server will use that address coordinates as the center.
 *         schema:
 *           type: string
 *       - in: query
 *         name: lat
 *         description: Latitude for ad-hoc center (used when device/location coordinates are provided). Honored only if user's location services are enabled.
 *         schema:
 *           type: number
 *           format: float
 *       - in: query
 *         name: lon
 *         description: Longitude for ad-hoc center (used when device/location coordinates are provided). Honored only if user's location services are enabled.
 *         schema:
 *           type: number
 *           format: float
 *       - in: query
 *         name: radius_miles
 *         description: Radius in miles to search for events around the selected center (overrides user's saved radius).
 *         schema:
 *           type: number
 *           format: float
 *           default: 25
 *       - in: query
 *         name: apply_profile_radius
 *         description: If true, server will use user's saved profile latitude/longitude as center for geo filtering. Defaults to false (no profile-based filtering).
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: A list of events with geo metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 center:
 *                   type: object
 *                   nullable: true
 *                   description: The center used for geo filtering (if any)
 *                   properties:
 *                     source:
 *                       type: string
 *                       enum: [saved_location, device, profile_location]
 *                     id:
 *                       type: string
 *                       description: saved address id when source == saved_location
 *                     name:
 *                       type: string
 *                     lat:
 *                       type: number
 *                     lon:
 *                       type: number
 *                     radius_miles:
 *                       type: number
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     allOf:
 *                       - $ref: '#/components/schemas/Event'
 *                       - type: object
 *                         properties:
 *                           distanceMeters:
 *                             type: number
 *                             description: Distance from center in meters (if center used)
 *                           distanceMiles:
 *                             type: number
 *                             description: Distance from center in miles (if center used)
 *       400:
 *         description: Bad request (e.g., selected saved location missing coordinates or invalid params)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", validateToken, authorizeRoles("user"), getEvents);

/**
 * @swagger
 * /api/events/{eventId}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         description: The ID of the event
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 */
router.get("/:eventId", validateToken, authorizeRoles("user"), getEventById);

/**
 * @swagger
 * /api/events/{eventId}:
 *   put:
 *     summary: Update an event with optional image upload
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         description: Event ID to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               eventType:
 *                 type: string
 *                 enum: [normal, burst]
 *                 description: The type of the event (normal or burst).
 *               eventCategoryId:
 *                 type: string
 *                 description: The ID of the event category.
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: The start date and time of the event.
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: The end date and time of the event.
 *               title:
 *                 type: string
 *                 description: The title of the event.
 *               description:
 *                 type: string
 *                 description: A detailed description of the event.
 *               location:
 *                 type: string
 *                 description: The location where the event will take place.
 *               latitude:
 *                 type: number
 *                 format: float
 *                 description: The latitude of the event location.
 *               longitude:
 *                 type: number
 *                 format: float
 *                 description: The longitude of the event location.
 *               status:
 *                 type: string
 *                 enum: [draft, published, canceled, completed]
 *                 description: The status of the event. Defaults to 'draft' if not provided.
 *               attendees:
 *                 type: string
 *                 description: A comma-separated list of user IDs invited to the event.
 *                 example: "userID1,userID2,userID3"
 *               visibility:
 *                 type: string
 *                 enum: [public, private]
 *                 description: The visibility of the event. Admins and business users can set it to public, but users can only set it to private.
 *               image:
 *                 type: string
 *                 format: binary  # Specify that the image is a file (binary data)
 *                 description: The image associated with the event (optional).
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     eventId:
 *                       type: string
 *                       description: The ID of the event.
 *                     title:
 *                       type: string
 *                       description: The title of the event.
 *                     description:
 *                       type: string
 *                       description: The description of the event.
 *                     status:
 *                       type: string
 *                       enum: [draft, published, canceled, completed]
 *                       description: The status of the event.
 *                     visibility:
 *                       type: string
 *                       enum: [public, private]
 *                       description: The visibility status of the event (updated if provided).
 *                     imagePath:
 *                       type: string
 *                       description: The URL/path of the event image (if uploaded).
 */
router.put(
  "/:eventId",
  validateToken,
  authorizeRoles("user"),
  upload.single("image"), // Handle image file upload with field name "image"
  updateEvent
);

/**
 * @openapi
 * /api/events/{eventId}/calendar:
 *   patch:
 *     tags:
 *       - Events
 *     summary: Add or remove an event to/from the authenticated user's calendar (toggle or explicit)
 *     operationId: toggleEventCalendar
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: eventId
 *         in: path
 *         description: ID of the event to add/remove from calendar
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isCalendarAdded:
 *                 type: boolean
 *                 description: true to add, false to remove. If omitted server toggles current state.
 *             example:
 *               isCalendarAdded: true
 *     responses:
 *       '200':
 *         description: Calendar flag updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 isCalendarAdded:
 *                   type: boolean
 *       '400':
 *         description: Bad request / invalid eventId
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: User or Event not found
 */
router.patch(
  "/:eventId/calendar",
  validateToken,
  authorizeRoles("user"),
  toggleCalendar
);

/**
 * @openapi
 * /api/events/{eventId}/notification:
 *   patch:
 *     tags:
 *       - Events
 *     summary: Enable or disable notifications for a specific event for the authenticated user
 *     operationId: toggleEventNotification
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: eventId
 *         in: path
 *         description: ID of the event
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isNotificationEnabled:
 *                 type: boolean
 *                 description: true to enable notifications, false to disable. If omitted server toggles.
 *             example:
 *               isNotificationEnabled: true
 *     responses:
 *       '200':
 *         description: Notification flag updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 isNotificationEnabled:
 *                   type: boolean
 *       '400':
 *         description: Bad request / invalid eventId
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: User or Event not found
 */
router.patch(
  "/:eventId/notification",
  validateToken,
  authorizeRoles("user"),
  toggleEventNotification
);

/**
 * @openapi
 * /api/events/{eventId}/save:
 *   patch:
 *     tags:
 *       - Events
 *     summary: Save or unsave an event for the authenticated user (toggle or explicit). Updates Event.saves.
 *     operationId: toggleEventSave
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: eventId
 *         in: path
 *         description: ID of the event to save/unsave
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isEventSaved:
 *                 type: boolean
 *                 description: true to save, false to unsave. If omitted server toggles.
 *             example:
 *               isEventSaved: true
 *     responses:
 *       '200':
 *         description: Event save status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 isEventSaved:
 *                   type: boolean
 *       '400':
 *         description: Bad request / invalid eventId
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: User or Event not found
 */
router.patch(
  "/:eventId/save",
  validateToken,
  authorizeRoles("user"),
  toggleSaveEvent
);

/**
 * @swagger
 * /api/events/{eventId}/attendees/{userId}:
 *   delete:
 *     summary: Remove an attendee from an event
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         description: Event ID from which the attendee will be removed
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         description: User ID to remove from the event's attendees list
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attendee removed successfully
 *       400:
 *         description: Invalid event ID or user ID
 *       404:
 *         description: Event or attendee not found
 */
router.delete(
  "/:eventId/attendees/:userId",
  validateToken,
  authorizeRoles("user"),
  removeAttendee
);

/**
 * @swagger
 * /api/events/{eventId}/attendees/{userId}:
 *   post:
 *     summary: Add one or more attendees to an event
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         description: Event ID to which the attendee(s) will be added
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         description: Comma-separated user ID(s) to add to the event's attendees list
 *         example: "user123,user456"
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attendees added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     added:
 *                       type: array
 *                       items:
 *                         type: string
 *                     eventId:
 *                       type: string
 *       400:
 *         description: Bad Request – invalid IDs or user already an attendee
 *       404:
 *         description: Event or user not found
 *       500:
 *         description: Internal Server Error
 */
router.post(
  "/:eventId/attendees/:userId",
  validateToken,
  authorizeRoles("user"),
  addAttendee
);

/**
 * @swagger
 * /api/events/{eventId}:
 *   delete:
 *     summary: Delete an event
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         description: Event ID to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found
 */
router.delete("/:eventId", validateToken, authorizeRoles("user"), deleteEvent);

/**
 * @swagger
 * /api/events/{eventId}/group:
 *   get:
 *     summary: Get group chat members for an event
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         description: ID of the event to fetch group members for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Group chat members fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     eventId:
 *                       type: string
 *                       description: ID of the event
 *                     members:
 *                       type: array
 *                       description: List of group chat members (creator + attendees)
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           profileImage:
 *                             type: string
 *       404:
 *         description: Group chat not found for the given event ID
 *       500:
 *         description: Server error occurred
 */
router.get(
  "/:eventId/group",
  validateToken,
  authorizeRoles("user"),
  getGroupChatByEventId
);

/**
 * @swagger
 * /api/events/group-chats/user/{userId}:
 *   get:
 *     summary: Get all group chats where the user is a member
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         required: false
 *         description: Page number (default 1)
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Page size, max 100 (default 10)
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *       - in: query
 *         name: search
 *         required: false
 *         description: Case-insensitive search across group name/title/description
 *         schema:
 *           type: string
 *       - in: query
 *         name: order
 *         required: false
 *         description: Sort direction (asc or desc; default desc)
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: orderBy
 *         required: false
 *         description: Field to sort by (default timestamp)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of group chats the user is part of
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       groupId:
 *                         type: string
 *                       event:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           imagePath:
 *                             type: string
 *                           startDate:
 *                             type: string
 *                             format: date-time
 *                           endDate:
 *                             type: string
 *                             format: date-time
 *                           location:
 *                             type: string
 *                           latitude:
 *                             type: number
 *                           longitude:
 *                             type: number
 *                       createdBy:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id: { type: string }
 *                           name: { type: string }
 *                           email: { type: string }
 *                           profileImage: { type: string }
 *                       members:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             email:
 *                               type: string
 *                             profileImage:
 *                               type: string
 *                       lastMessage:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           message:
 *                             type: string
 *                           sentBy:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               id: { type: string }
 *                               name: { type: string }
 *                               profileImage: { type: string }
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     total: { type: integer }
 *                     totalPages: { type: integer }
 *                     hasNextPage: { type: boolean }
 *                     hasPrevPage: { type: boolean }
 *                     order: { type: string, enum: [asc, desc] }
 *                     orderBy: { type: string }
 *                     search: { type: string }
 */
router.get(
  "/group-chats/user/:userId",
  validateToken,
  authorizeRoles("user"),
  getGroupChatsForUser
);

/**
 * @swagger
 * /api/events/{eventId}/upload-photo:
 *   post:
 *     summary: Upload a photo for an event (only one per user)
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         description: Event ID for which the user wants to upload a photo
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     imageUrl:
 *                       type: string
 *       400:
 *         description: User already uploaded an image or image missing
 *       404:
 *         description: Event not found
 */
router.post(
  "/:eventId/upload-photo",
  validateToken,
  authorizeRoles("user"),
  upload.single("image"),
  uploadEventImage
);

/**
 * @swagger
 * /api/events/{eventId}/images:
 *   get:
 *     summary: Get all images uploaded for an event (separating current user's image)
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         description: Event ID to fetch all uploaded images
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event images list with user's own image separated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 myImage:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     uploadedBy:
 *                       type: object
 *                       properties:
 *                         id: { type: string }
 *                         name: { type: string }
 *                         email: { type: string }
 *                         profileImage: { type: string }
 *                     imageUrl: { type: string }
 *                     uploadedAt: { type: string, format: date-time }
 *                 otherImages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       uploadedBy:
 *                         type: object
 *                         properties:
 *                           id: { type: string }
 *                           name: { type: string }
 *                           email: { type: string }
 *                           profileImage: { type: string }
 *                       imageUrl: { type: string }
 *                       uploadedAt: { type: string, format: date-time }
 *                 total:
 *                   type: integer
 *       404:
 *         description: Event not found
 */
router.get(
  "/:eventId/images",
  validateToken,
  authorizeRoles("user"),
  getEventImages
);

/**
 * @swagger
 * /api/events/{eventId}/attending:
 *   post:
 *     summary: Mark current user as attending the event (and optionally set attendingPhoto)
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         description: The ID of the event to attend
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               attendingPhoto:
 *                 type: boolean
 *                 description: Whether the user uploaded a photo at the time of confirming attendance
 *                 default: false
 *     responses:
 *       200:
 *         description: Marked as attending or updated photo flag
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     eventId: { type: string }
 *                     attendingCount: { type: integer }
 *                     attending:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           user: { type: string }
 *                           attendingPhoto: { type: boolean }
 *                           confirmedAt: { type: string, format: date-time }
 *                     me:
 *                       type: object
 *                       properties:
 *                         user: { type: string }
 *                         attendingPhoto: { type: boolean }
 *       404:
 *         description: Event not found
 */
router.post(
  "/:eventId/attending",
  validateToken,
  authorizeRoles("user"),
  attendEvent
);

/**
 * @swagger
 * /api/events/{eventId}/attending:
 *   get:
 *     summary: Get attending users for an event (and your own status)
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         description: The ID of the event
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attending list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     eventId: { type: string }
 *                     title: { type: string }
 *                     isAttending: { type: boolean }
 *                     total: { type: integer }
 *                     attending:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id: { type: string }
 *                           name: { type: string }
 *                           email: { type: string }
 *                           profileImage: { type: string }
 *       404:
 *         description: Event not found
 */
router.get(
  "/:eventId/attending",
  validateToken,
  authorizeRoles("user"),
  getAttending
);

/**
 * @swagger
 * /api/events/{eventId}/attending:
 *   delete:
 *     summary: Remove current user's attending confirmation for an event
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         description: The ID of the event
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Removed from attending
 *       400:
 *         description: You are not marked as attending
 *       404:
 *         description: Event not found
 */
router.delete(
  "/:eventId/attending",
  validateToken,
  authorizeRoles("user"),
  removeAttending
);

/**
 * @swagger
 * /api/events/{eventId}/view:
 *   post:
 *     summary: Record a user's view for an event (unique per user)
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         description: The ID of the event being viewed
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: View recorded successfully or already viewed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   enum: ["View recorded", "Already viewed"]
 *                   description: Indicates whether this view was new or already counted
 *                 data:
 *                   type: object
 *                   properties:
 *                     viewed:
 *                       type: boolean
 *                       description: True if user has viewed the event (always true)
 *                     viewCount:
 *                       type: integer
 *                       description: Total number of unique views on the event
 *       401:
 *         description: Unauthorized — user must be logged in
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 *
 *     examples:
 *       application/json:
 *         New View:
 *           {
 *             "success": true,
 *             "message": "View recorded",
 *             "data": { "viewed": true, "viewCount": 51 }
 *           }
 *         Already Viewed:
 *           {
 *             "success": true,
 *             "message": "Already viewed",
 *             "data": { "viewed": true, "viewCount": 51 }
 *           }
 */
router.post("/:eventId/view", validateToken, authorizeRoles("user"), viewEvent);

/**
 * @swagger
 * /api/events/{eventId}/save:
 *   post:
 *     summary: Increment the save count for an event
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         description: The ID of the event to increment save count
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Save count incremented successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Save count incremented"
 *                 data:
 *                   type: object
 *                   properties:
 *                     eventId:
 *                       type: string
 *                     saves:
 *                       type: integer
 *                       description: The updated save count for the event
 *       400:
 *         description: Invalid event ID
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 *     examples:
 *       application/json:
 *         Success Response:
 *           {
 *             "success": true,
 *             "message": "Save count incremented",
 *             "data": {
 *               "eventId": "69020d7b95df40689c078514",
 *               "saves": 5
 *             }
 *           }
 */
router.post(
  "/:eventId/save",
  validateToken,
  authorizeRoles("user"),
  incrementSave
);

/**
 * @swagger
 * /api/events/{eventId}/share:
 *   post:
 *     summary: Increment the share count for an event
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         description: The ID of the event to increment share count
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Share count incremented successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Share count incremented"
 *                 data:
 *                   type: object
 *                   properties:
 *                     eventId:
 *                       type: string
 *                     shares:
 *                       type: integer
 *                       description: The updated share count for the event
 *       400:
 *         description: Invalid event ID
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 *     examples:
 *       application/json:
 *         Success Response:
 *           {
 *             "success": true,
 *             "message": "Share count incremented",
 *             "data": {
 *               "eventId": "69020d7b95df40689c078514",
 *               "shares": 12
 *             }
 *           }
 */
router.post(
  "/:eventId/share",
  validateToken,
  authorizeRoles("user"),
  incrementShare
);

/**
 * @swagger
 * /api/events/{eventId}/click:
 *   post:
 *     summary: Increment the click count for an event
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         description: The ID of the event to increment click count
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Click count incremented successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Click count incremented"
 *                 data:
 *                   type: object
 *                   properties:
 *                     eventId:
 *                       type: string
 *                     clicks:
 *                       type: integer
 *                       description: The updated click count for the event
 *       400:
 *         description: Invalid event ID
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 *     examples:
 *       application/json:
 *         Success Response:
 *           {
 *             "success": true,
 *             "message": "Click count incremented",
 *             "data": {
 *               "eventId": "69020d7b95df40689c078514",
 *               "clicks": 25
 *             }
 *           }
 */
router.post(
  "/:eventId/click",
  validateToken,
  authorizeRoles("user"),
  incrementClick
);

module.exports = router;
