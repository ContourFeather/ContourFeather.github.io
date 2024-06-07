const hour_maps = [
    [
        10.1, 10.3, 10.3, 10.1, 10.0, 9.9, 9.7, 9.9, 9.8, 9.8, 9.8, 9.8, 
        10.5, 10.2, 10.2, 9.2, 8.9, 9.0, 8.7, 8.3, 8.0, 7.8, 7.3, 7.1,
    ],
    [
        -0.7, -1.6, -2.1, -2.1, -2.3, -2.5, -2.5, -2.5, -2.9, -3.2, -3.4, -3.3, 
        -3.7, -3.9, -3.7, -4.0, -4.2, -4.1, -4.2, -4.5, -4.4, -4.5, -4.3, -4.3,
    ],
    [
        5.1, 5.3, 5.2, 5.1, 4.8, 5.3, 6.2, 6.9, 5.7, 5.2, 5.6, 6.2, 
        6.3, 4.7, 4.1, 5.1, 4.8, 3.6, 3.0, 2.7, 2.0, -0.4, -0.6, 0.6,
    ],
    [
        -3.6, -3.8, -3.9, -4.1, -4.0, -4.0, -3.5, -3.6, -3.4, -3.1, -2.4, -0.8, 
        -0.8, -1.3, 1.9, 1.8, 2.0, 2.4, 3.3, 3.9, 4.1, 4.8, 5.0, 5.5
    ],
];

const day_bounds = [ // Elements in the form of [max, min]. 
    [10.9, 7.3], 
    [6.5, 5.0], 
    [-0.4, -4.6], 
    [8.4, 4.6], 
    [10.4, 6.6], 
    [8.4, 2.4],
];

const noise_map_coarse = [-3, -0.5, 0.5, 3];
const noise_map_fine = [-0.4, -0.1, 0.1, 0.4];
const noise_map_extra_fine = [-0.2, -0.05, 0.05, -0.2];

function rand(list) {
    return list[~~(list.length * Math.random())];
};

function rescale(list, lower, upper) {
    var out = list;
    const min = Math.min(...list);
    const max = Math.max(...list);
    const length = list.length;
    for (let i = 0; i < length; i++) {
        out[i] = ((list[i] - min) / (max - min) * (upper - lower) + lower);
    };
    return out;
};

function generateTEMP(days) {
    var out = [];
    for (let day = 0; day < days; day++) {
        var bounds = rand(day_bounds);
        const coarse_dis = rand(noise_map_coarse) * Math.random();
        bounds[0] = bounds[0] + coarse_dis;
        bounds[1] = bounds[1] + coarse_dis;
        var hours = rand(hour_maps);
        const h_length = hours.length
        for (let i = 0; i < h_length; i++) {
            hours[i] = hours[i] + (rand(noise_map_fine) * Math.random());
        };
        out.push(rescale(hours, bounds[1], bounds[0]));
    };
    return out;
};

function interpolTEMP(map, hours) {
    const q = ~~(hours / 24);
    const r = hours % 24; 
    if (Number.isInteger(r)) {
        if (r === 0) {
            return map[q - 1][23];
        } else {
            return map[q][r - 1];
        };
    } else {
        const floor = Math.floor(hours);
        const ceil = Math.ceil(hours);
        const below = interpolTEMP(map, floor) * (ceil - hours);
        const above = interpolTEMP(map, ceil) * (hours - floor);
        return (above + below + (rand(noise_map_extra_fine) * Math.random()));
    };
};

const output = generateTEMP(3)
console.log(output)
console.log(interpolTEMP(output, 24.5))