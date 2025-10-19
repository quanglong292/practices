function throttle(fnc, delay) {
    let endTime = 0;
    let id = 0;
    return function (...args) {
        const curnt = new Date().getTime();
        id++;
        if (curnt < endTime && endTime) return;
        endTime = curnt + delay;
        console.log(`Called ${id} - C ${curnt} - E ${endTime}`);
        fnc(args);
    }
};

const logger = () => console.log("---");

const callLoggerThrottle = throttle(logger, 1);
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();
callLoggerThrottle();