import { Lists } from './listsFn.js'
import { HashMap } from './HashMapFn.js'
var t = new Lists();

export function SiZhuInfo() {
        this.getSiZhu = function(n, e) {
            var r = n[0];
            return "甲" == r || "己" == r ? (t.Clear(), t.Insert(0, "甲"), t.Insert(1, "乙"), t.Insert(2, "丙"), 
            t.Insert(3, "丁"), t.Insert(4, "戊"), t.Insert(5, "己"), t.Insert(6, "庚"), t.Insert(7, "辛"), 
            t.Insert(8, "壬"), t.Insert(9, "癸")) : "乙" == r || "庚" == r ? (t.Clear(), t.Insert(0, "丙"), 
            t.Insert(1, "丁"), t.Insert(2, "戊"), t.Insert(3, "己"), t.Insert(4, "庚"), t.Insert(5, "辛"), 
            t.Insert(6, "壬"), t.Insert(7, "癸"), t.Insert(8, "甲"), t.Insert(9, "乙")) : "丙" == r || "辛" == r ? (t.Clear(), 
            t.Insert(0, "戊"), t.Insert(1, "己"), t.Insert(2, "庚"), t.Insert(3, "辛"), t.Insert(4, "壬"), 
            t.Insert(5, "癸"), t.Insert(6, "甲"), t.Insert(7, "乙"), t.Insert(8, "丙"), t.Insert(9, "丁")) : "丁" == r || "壬" == r ? (t.Clear(), 
            t.Insert(0, "庚"), t.Insert(1, "辛"), t.Insert(2, "壬"), t.Insert(3, "癸"), t.Insert(4, "甲"), 
            t.Insert(5, "乙"), t.Insert(6, "丙"), t.Insert(7, "丁"), t.Insert(8, "戊"), t.Insert(9, "己")) : "戊" != r && "癸" != r || (t.Clear(), 
            t.Insert(0, "壬"), t.Insert(1, "癸"), t.Insert(2, "甲"), t.Insert(3, "乙"), t.Insert(4, "丙"), 
            t.Insert(5, "丁"), t.Insert(6, "戊"), t.Insert(7, "己"), t.Insert(8, "庚"), t.Insert(9, "辛")), 
            t.toString(e);
        }, this.getKongWang = function(t) {
            var e = new Lists(), r = "甲乙丙丁戊己庚辛壬癸".indexOf(t[0]), s = "子丑寅卯辰巳午未申酉戌亥".indexOf(t[1]);
            return 0 == s ? (e.Clear(), e.Insert(0, "子"), e.Insert(1, "亥"), e.Insert(2, "戌"), 
            e.Insert(3, "酉"), e.Insert(4, "申"), e.Insert(5, "未"), e.Insert(6, "午"), e.Insert(7, "巳"), 
            e.Insert(8, "辰"), e.Insert(9, "卯"), e.Insert(10, "寅"), e.Insert(11, "丑")) : 1 == s ? (e.Clear(), 
            e.Insert(0, "丑"), e.Insert(1, "子"), e.Insert(2, "亥"), e.Insert(3, "戌"), e.Insert(4, "酉"), 
            e.Insert(5, "申"), e.Insert(6, "未"), e.Insert(7, "午"), e.Insert(8, "巳"), e.Insert(9, "辰"), 
            e.Insert(10, "卯"), e.Insert(11, "寅")) : 2 == s ? (e.Clear(), e.Insert(0, "寅"), e.Insert(1, "丑"), 
            e.Insert(2, "子"), e.Insert(3, "亥"), e.Insert(4, "戌"), e.Insert(5, "酉"), e.Insert(6, "申"), 
            e.Insert(7, "未"), e.Insert(8, "午"), e.Insert(9, "巳"), e.Insert(10, "辰"), e.Insert(11, "卯")) : 3 == s ? (e.Clear(), 
            e.Insert(0, "卯"), e.Insert(1, "寅"), e.Insert(2, "丑"), e.Insert(3, "子"), e.Insert(4, "亥"), 
            e.Insert(5, "戌"), e.Insert(6, "酉"), e.Insert(7, "申"), e.Insert(8, "未"), e.Insert(9, "午"), 
            e.Insert(10, "巳"), e.Insert(11, "辰")) : 4 == s ? (e.Clear(), e.Insert(0, "辰"), e.Insert(1, "卯"), 
            e.Insert(2, "寅"), e.Insert(3, "丑"), e.Insert(4, "子"), e.Insert(5, "亥"), e.Insert(6, "戌"), 
            e.Insert(7, "酉"), e.Insert(8, "申"), e.Insert(9, "未"), e.Insert(10, "午"), e.Insert(11, "巳")) : 5 == s ? (e.Clear(), 
            e.Insert(0, "巳"), e.Insert(1, "辰"), e.Insert(2, "卯"), e.Insert(3, "寅"), e.Insert(4, "丑"), 
            e.Insert(5, "子"), e.Insert(6, "亥"), e.Insert(7, "戌"), e.Insert(8, "酉"), e.Insert(9, "申"), 
            e.Insert(10, "未"), e.Insert(11, "午")) : 6 == s ? (e.Clear(), e.Insert(0, "午"), e.Insert(1, "巳"), 
            e.Insert(2, "辰"), e.Insert(3, "卯"), e.Insert(4, "寅"), e.Insert(5, "丑"), e.Insert(6, "子"), 
            e.Insert(7, "亥"), e.Insert(8, "戌"), e.Insert(9, "酉"), e.Insert(10, "申"), e.Insert(11, "未")) : 7 == s ? (e.Clear(), 
            e.Insert(0, "未"), e.Insert(1, "午"), e.Insert(2, "巳"), e.Insert(3, "辰"), e.Insert(4, "卯"), 
            e.Insert(5, "寅"), e.Insert(6, "丑"), e.Insert(7, "子"), e.Insert(8, "亥"), e.Insert(9, "戌"), 
            e.Insert(10, "酉"), e.Insert(11, "申")) : 8 == s ? (e.Clear(), e.Insert(0, "申"), e.Insert(1, "未"), 
            e.Insert(2, "午"), e.Insert(3, "巳"), e.Insert(4, "辰"), e.Insert(5, "卯"), e.Insert(6, "寅"), 
            e.Insert(7, "丑"), e.Insert(8, "子"), e.Insert(9, "亥"), e.Insert(10, "戌"), e.Insert(11, "酉")) : 9 == s ? (e.Clear(), 
            e.Insert(0, "酉"), e.Insert(1, "申"), e.Insert(2, "未"), e.Insert(3, "午"), e.Insert(4, "巳"), 
            e.Insert(5, "辰"), e.Insert(6, "卯"), e.Insert(7, "寅"), e.Insert(8, "丑"), e.Insert(9, "子"), 
            e.Insert(10, "亥"), e.Insert(11, "戌")) : 10 == s ? (e.Clear(), e.Insert(0, "戌"), 
            e.Insert(1, "酉"), e.Insert(2, "申"), e.Insert(3, "未"), e.Insert(4, "午"), e.Insert(5, "巳"), 
            e.Insert(6, "辰"), e.Insert(7, "卯"), e.Insert(8, "寅"), e.Insert(9, "丑"), e.Insert(10, "子"), 
            e.Insert(11, "亥")) : 11 == s && (e.Clear(), e.Insert(0, "亥"), e.Insert(1, "戌"), 
            e.Insert(2, "酉"), e.Insert(3, "申"), e.Insert(4, "未"), e.Insert(5, "午"), e.Insert(6, "巳"), 
            e.Insert(7, "辰"), e.Insert(8, "卯"), e.Insert(9, "寅"), e.Insert(10, "丑"), e.Insert(11, "子")), 
            e.toString(r + 3) + e.toString(r + 2);
        }, this.getZhuGua = function(n, t, e) {
            for (var r = n[t - 1], s = n[e - 1], I = "", u = 0; u < r.length; u++) I += r[u] + "";
            I += "-";
            for (u = 0; u < s.length; u++) I += s[u] + "";
            return I;
        }, this.getHuGua = function(n, t, e) {
            var r = n[t - 1], s = n[e - 1], I = "";
            return I += r[1] + "" + r[2] + s[0] + "-", I += r[2] + "" + s[0] + s[1];
        }, this.getBianGua = function(n, t, e, r) {
            var s = n[t - 1], I = n[e - 1];
            t == e && (I = s.slice());
            var u = "";
            r <= 3 ? 3 == r ? I[0] = I[0] > 0 ? 0 : 1 : 2 == r ? I[1] = I[1] > 0 ? 0 : 1 : 1 == r && (I[2] = I[2] > 0 ? 0 : 1) : 6 == r ? s[0] = s[0] > 0 ? 0 : 1 : 5 == r ? s[1] = s[1] > 0 ? 0 : 1 : 4 == r && (s[2] = s[2] > 0 ? 0 : 1);
            for (var i = 0; i < s.length; i++) u += s[i] + "";
            u += "-";
            for (i = 0; i < I.length; i++) u += I[i] + "";
            return u;
        }, this.getSiZhuQufen = function(n) {
            var t = n.replace(/\s*/g, ""), e = t.substr(0, 2), r = t.substr(2, 2), s = t.substr(4, 2), I = t.substr(6, 2), u = t.substr(8, 5);
            return new Array(e, r, s, I, u);
        }, this.getMap = function() {
            var n = new HashMap();
            return n.put("111", "qian"), n.put("011", "dui"), n.put("101", "li"), n.put("001", "zhen"), 
            n.put("110", "xun"), n.put("010", "kan"), n.put("100", "gen"), n.put("000", "kun"), 
            n;
        }, this.getMap64 = function() {
            var n = new HashMap();
            return n.put("qianqian", "乾为天"), n.put("kunkun", "坤为地"), n.put("kanzhen", "水雷屯"), 
            n.put("genkan", "山水蒙"), n.put("kanqian", "水天需"), n.put("qiankan", "天水讼"), n.put("kunkan", "地水师"), 
            n.put("kankun", "水地比"), n.put("xunqian", "风天小畜"), n.put("qiandui", "天泽履"), n.put("kunqian", "地天泰"), 
            n.put("qiankun", "天地否"), n.put("qianli", "天火同人"), n.put("liqian", "火天大有"), n.put("kungen", "地山谦"), 
            n.put("zhenkun", "雷地豫"), n.put("duizhen", "泽雷随"), n.put("genxun", "山风蛊"), n.put("kundui", "地泽临"), 
            n.put("xunkun", "风地观"), n.put("lizhen", "火雷噬嗑"), n.put("genli", "山火贲"), n.put("genkun", "山地剥"), 
            n.put("kunzhen", "地雷复"), n.put("qianzhen", "天雷无妄"), n.put("genqian", "山天大畜"), n.put("genzhen", "山雷颐"), 
            n.put("duixun", "泽风大过"), n.put("kankan", "坎为水"), n.put("lili", "离为火"), n.put("duigen", "泽山咸"), 
            n.put("zhenxun", "雷风恒"), n.put("qiangen", "天山遁"), n.put("zhenqian", "雷天大壮"), n.put("likun", "火地晋"), 
            n.put("kunli", "地火明夷"), n.put("xunli", "风火家人"), n.put("lidui", "火泽睽"), n.put("kangen", "水山蹇"), 
            n.put("zhenkan", "雷水解"), n.put("gendui", "山泽损"), n.put("xunzhen", "风雷益"), n.put("duiqian", "泽天夬"), 
            n.put("qianxun", "天风姤"), n.put("duikun", "泽地萃"), n.put("kunxun", "地风升"), n.put("duikan", "泽水困"), 
            n.put("kanxun", "水风井"), n.put("duili", "泽火革"), n.put("lixun", "火风鼎"), n.put("zhenzhen", "震为雷"), 
            n.put("gengen", "艮为山"), n.put("xungen", "风山渐"), n.put("zhendui", "雷泽归妹"), n.put("zhenli", "雷火丰"), 
            n.put("ligen", "火山旅"), n.put("xunxun", "巽为风"), n.put("duidui", "兑为泽"), n.put("xunkan", "风水涣"), 
            n.put("kandui", "水泽节"), n.put("xundui", "风泽中孚"), n.put("zhengen", "雷山小过"), n.put("kanli", "水火既济"), 
            n.put("likan", "火水未济"), n;
        };
}