const logger = {
    info: (data) => {
        console.log(JSON.stringify(data));
    },
    error: (data) => {
        console.error(JSON.stringify(data));
    }
};

module.exports = { logger }; 