const {
    contextBridge,
    ipcRenderer
} = require("electron");

const validChannels = ["to", "from"];

// Expose protected methods that allow the renderer process to use the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "api", {
        send: (channel, data) => {
            //console.log(channel, data);
            if (validChannels.includes(channel)) { // whitelist channels
                ipcRenderer.send(channel, data);
            }
        },
        receive: (channel, func) => {
            //console.log(channel);
            if (validChannels.includes(channel)) {
                ipcRenderer.on(channel, (event, ...args) => func(...args)); // Deliberately strip event as it includes `sender` 
            }
        },
        // once: (channel, callback) => {
        //   if (validChannels.includes(channel)) {
        //     const newCallback = (_, data) => callback(data);
        //     ipcRenderer.once(channel, newCallback);
        //   }
        // },
        // removeListener: (channel, callback) => {
        //   if (validChannels.includes(channel)) {
        //     ipcRenderer.removeListener(channel, callback);
        //   }
        // },
        // removeAllListeners: (channel) => {
        //   if (validChannels.includes(channel)) {
        //     ipcRenderer.removeAllListeners(channel)
        //   }
        // },
    }
);