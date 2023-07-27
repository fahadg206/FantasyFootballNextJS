export var round = function (num) {
    if (typeof num === "string") {
        num = parseFloat(num);
    }
    return (Math.round((num + Number.EPSILON) * 100) / 100).toFixed(2);
};
