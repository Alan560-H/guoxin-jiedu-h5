function e(e) {
    return (e = e.toString())[1] ? e : "0" + e;
}

export default function (t, u) {
    var r = [ "Y", "M", "D", "h", "m", "s" ], s = [], n = new Date(t);
    for (var o in s.push(n.getFullYear()), s.push(e(n.getMonth() + 1)), s.push(e(n.getDate())), 
    s.push(e(n.getHours())), s.push(e(n.getMinutes())), s.push(e(n.getSeconds())), s) u = u.replace(r[o], s[o]);
    return u;
}
