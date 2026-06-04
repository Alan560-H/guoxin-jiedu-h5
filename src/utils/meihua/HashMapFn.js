export function HashMap() {
        var n = 0, t = new Object();
        this.isEmpty = function() {
            return 0 == n;
        }, this.containsKey = function(n) {
            return n in t;
        }, this.containsValue = function(n) {
            for (var i in t) if (t[i] == n) return !0;
            return !1;
        }, this.put = function(i, e) {
            this.containsKey(i) || n++, t[i] = e;
        }, this.get = function(n) {
            return this.containsKey(n) ? t[n] : null;
        }, this.remove = function(i) {
            this.containsKey(i) && delete t[i] && n--;
        }, this.values = function() {
            var n = new Array();
            for (var i in t) n.push(t[i]);
            return n;
        }, this.keySet = function() {
            var n = new Array();
            for (var i in t) n.push(i);
            return n;
        }, this.size = function() {
            return n;
        }, this.clear = function() {
            n = 0, t = new Object();
        };
}