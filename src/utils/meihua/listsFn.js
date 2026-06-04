function t(t, e) {
    return {
        data: t,
        next: e
    };
}

export function Lists() {
        this.pRear = null, this.length = 0, this.InsertAtEnd = function(e) {
            if (0 == this.length) {
                var n = new t(e, this.pRear);
                this.pRear = n, n.next = this.pRear;
            } else {
                n = new t(e, this.pRear.next);
                this.pRear.next = n, this.pRear = n;
            }
            this.length++;
        }, this.InsertAtFirst = function(e) {
            if (0 == this.length) {
                var n = new t(e, this.pRear);
                this.pRear = n, n.next = this.pRear;
            } else {
                n = new t(e, this.pRear.next);
                this.pRear.next = n;
            }
            this.length++;
        }, this.Locate = function(t) {
            if (t < 0 || t > this.length - 1) throw new Error("索引值有错");
            for (var e = this.pRear.next, n = 0; n < t; n++) e = e.next;
            return e;
        }, this.Insert = function(e, n) {
            if (e < 0 || e > this.length) throw new Error("索引值有错");
            if (0 == e) this.InsertAtFirst(n); else if (e == this.length) this.InsertAtEnd(n); else {
                var i = new t(n, this.Locate(e));
                this.Locate(e - 1).next = i, this.length++;
            }
        }, this.Search = function(t) {
            for (var e = this.pRear.next, n = 0; n < this.length; n++) {
                if (t == e.data) return n;
                e = e.next;
            }
            return -1;
        }, this.Clear = function() {
            this.length = 0, this.pRear = null;
        }, this.Remove = function(t) {
            if (t < 0 || t > this.length - 1 || 0 == this.length) throw new Error("索引值有错");
            if (1 == this.length) return this.Clear(), 1;
            0 == t ? this.pRear.next = this.Locate(0).next : this.Locate(t - 1).next = this.Locate(t).next;
        }, this.isEmpty = function() {
            return 0 == this.length;
        }, this.toString = function(t) {
            for (var e = this.pRear.next, n = "", i = 0; i < t; i++) i == t - 1 && (n = e.data), 
            e = e.next;
            return n;
        };
}