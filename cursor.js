// const host = "10.67.72.234:8888";

var host = "localhost:4444";


document.addEventListener('handcursorHover', function (event) {
    console.log('Target element:', event.target);
    console.log('Hand cursor is hovering over:', event.target);
    event.target.style.backgroundColor = 'red';
});

var frames = {
    socket: null,
    framesData: [], // Array to store frame data
    cursorElement: null, // Reference to cursor element
    jointId: 7, // Specify the joint ID here
    hoverTimer: null, // Timer for tracking hover time
    hoverDuration: 200, // Time threshold for hover event (in milliseconds)

    start: function () {
        var url = "ws://" + host + "/frames";
        frames.socket = new WebSocket(url);
        frames.socket.onmessage = function (event) {
            var frameData = JSON.parse(event.data);
            frames.framesData.push(frameData); // Store frame data
            frames.trackJointMovement(); // Track joint movement and update cursor
        }
    },

    // Function to track joint movement across frames
    trackJointMovement: function () {
        if (frames.framesData.length === 0) {
            return; // No frames available
        }

        // Get the latest frame data
        var frameData = frames.framesData[frames.framesData.length - 1];

        if (frameData.people.length < 1) {
            return; // No joint data in this frame
        }

        // Get joint position
        var joint = frameData.people[0].joints[frames.jointId];
        var joint_x = joint.position.x;
        var joint_y = joint.position.y;

        // Mirror left-right movement
        joint_x = frames.mirrorX(joint_x);

        // Move the cursor based on joint movement
        frames.moveCursor(joint_x, joint_y);

        // Check if the cursor is over any box elements
        frames.checkCursorOverBox();
    },

    // Function to mirror x-coordinate for left-right movement
    mirrorX: function (x) {
        // You can adjust the mirror logic here as needed
        return window.innerWidth - x;
    },

    // Function to move the cursor
    moveCursor: function (x, y) {
        if (!frames.cursorElement) {
            frames.createCursor(); // Create cursor if not already created
        }

        // Update cursor position based on joint movement
        frames.cursorElement.style.left = x + 'px';
        frames.cursorElement.style.top = y + 'px';
        frames.cursorElement.style.visibility = 'visible';
    },

    // Function to create the cursor element
    createCursor: function () {
        frames.cursorElement = document.createElement('div');
        frames.cursorElement.id = 'cursor';
        document.body.appendChild(frames.cursorElement);
    },

    // Function to check if the cursor is over any box elements
    checkCursorOverBox: function () {
        // Select all elements with the class "box"
        const boxes = document.querySelectorAll('.box');

        // Get the position of the cursor
        const cursorRect = frames.cursorElement.getBoundingClientRect();
        const cursorX = cursorRect.left;
        const cursorY = cursorRect.top;

        // Loop through each box element
        boxes.forEach(box => {
            // Get the position and dimensions of the box
            const boxRect = box.getBoundingClientRect();
            const boxTop = boxRect.top;
            const boxBottom = boxRect.bottom;
            const boxLeft = boxRect.left;
            const boxRight = boxRect.right;

            // Check if the cursor is within the bounds of the box
            if (cursorX >= boxLeft && cursorX <= boxRight && cursorY >= boxTop && cursorY <= boxBottom) {
                // Start or reset the hover timer
                if (!frames.hoverTimer) {
                    frames.hoverTimer = setTimeout(() => {
                        // Trigger a custom event after hover duration
                        const event = new Event('handcursorHover', { bubbles: true }); // Ensure event bubbles
                        // Dispatch the event on the box element
                        box.dispatchEvent(event);
                    }, frames.hoverDuration);
                }
            } else {
                // Cursor is not over the box, reset the hover timer
                clearTimeout(frames.hoverTimer);
                frames.hoverTimer = null;
            }
        });
    }
};


// Start WebSocket connection for frames
$(document).ready(function () {
    frames.start();
});