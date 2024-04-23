// Define your WebSocket host
// const host = "10.67.72.234:8888";

var host = "localhost:4444";
// Object to handle WebSocket connection for frames
var frames = {
    socket: null,
    framesData: [], // Array to store frame data
    cursorElement: null, // Reference to cursor element
    jointId: 7, // Specify the joint ID here

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
        
        var eye = document.querySelectorAll(".eye");
        eye.forEach(function (eye) {
            let eyex = (eye.getBoundingClientRect().left) + (eye.clientWidth / 2)
            let eyey = (eye.getBoundingClientRect().top) + (eye.clientHeight / 2);
            let radian = Math.atan2(x - eyex, y - eyey); // Swap cursorX and cursorY
            let rot = (radian * (180 / Math.PI) * -1) + 270;
            eye.style.transform = "rotate(" + rot + "deg)"
  
            })
            
            // Request the next animation frame to keep updating eye position
    },

    // Function to create the cursor element
    createCursor: function () {
        frames.cursorElement = document.createElement('div');
        frames.cursorElement.id = 'cursor';
        document.body.appendChild(frames.cursorElement);
    }
};

// Start WebSocket connection for frames
$(document).ready(function () {
    frames.start();
});
