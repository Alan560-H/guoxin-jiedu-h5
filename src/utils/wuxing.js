export default {
  wuxing: {
    木: {
      color: "#59e54e",
      img: "wood.png",
    },
    火: {
      color: "#cb270b",
      img: "fire.png",
    },
    土: {
      color: "#707070",
      img: "earth.png",
    },
    金: {
      color: "#fcaf00",
      img: "metal.png",
    },
    水: {
      color: "#407ef7",
      img: "water.png",
    }
  },
  ganzhiWuxing: {
    甲: {
      name: "甲木",
      color: "#00BA7D",
      img: "wood.png",
    },
    乙: {
      name: "乙木",
      color: "#00BA7D",
      img: "wood.png",
    },
    丙: {
      name: "丙火",
      color: "#C94400",
      img: "fire.png",
    },
    丁: {
      name: "丁火",
      color: "#C94400",
      img: "fire.png",
    },
    戊: {
      name: "戊土",
      color: "#926500",
      img: "earth.png",
    },
    己: {
      name: "己土",
      color: "#926500",
      img: "earth.png",
    },
    庚: {
      name: "庚金",
      color: "#ECAB47",
      img: "metal.png",
    },
    辛: {
      name: "辛金",
      color: "#ECAB47",
      img: "metal.png",
    },
    壬: {
      name: "壬水",
      color: "#007CD4",
      img: "water.png",
    },
    癸: {
      name: "癸水",
      color: "#007CD4",
      img: "water.png",
    },
    子: {
      name: "子水",
      color: "#007CD4",
      img: "water.png",
    },
    亥: {
      name: "亥水",
      color: "#007CD4",
      img: "water.png",
    },
    寅: {
      name: "寅木",
      color: "#00BA7D",
      img: "wood.png",
    },
    卯: {
      name: "卯木",
      color: "#00BA7D",
      img: "wood.png",
    },
    巳: {
      name: "巳火",
      color: "#C94400",
      img: "fire.png",
    },
    午: {
      name: "午火",
      color: "#C94400",
      img: "fire.png",
    },
    申: {
      name: "申金",
      color: "#ECAB47",
      img: "metal.png",
    },
    酉: {
      name: "酉金",
      color: "#ECAB47",
      img: "metal.png",
    },
    辰: {
      name: "辰土",
      color: "#926500",
      img: "earth.png",
    },
    戌: {
      name: "戌土",
      color: "#926500",
      img: "earth.png",
    },
    丑: {
      name: "丑土",
      color: "#926500",
      img: "earth.png",
    },
    未: {
      name: "未土",
      color: "#926500",
      img: "earth.png",
    },
  },
  jiulongGanzhiWuxing: {
    甲: {
      name: "甲木",
      color: "#008000",
      img: "wood.png",
    },
    乙: {
      name: "乙木",
      color: "#008000",
      img: "wood.png",
    },
    丙: {
      name: "丙火",
      color: "#FF0000",
      img: "fire.png",
    },
    丁: {
      name: "丁火",
      color: "#FF0000",
      img: "fire.png",
    },
    戊: {
      name: "戊土",
      color: "#995001",
      img: "earth.png",
    },
    己: {
      name: "己土",
      color: "#995001",
      img: "earth.png",
    },
    庚: {
      name: "庚金",
      color: "#FD7C04",
      img: "metal.png",
    },
    辛: {
      name: "辛金",
      color: "#FD7C04",
      img: "metal.png",
    },
    壬: {
      name: "壬水",
      color: "#0000FF",
      img: "water.png",
    },
    癸: {
      name: "癸水",
      color: "#0000FF",
      img: "water.png",
    },
    子: {
      name: "子水",
      color: "#0000FF",
      img: "water.png",
    },
    亥: {
      name: "亥水",
      color: "#0000FF",
      img: "water.png",
    },
    寅: {
      name: "寅木",
      color: "#008000",
      img: "wood.png",
    },
    卯: {
      name: "卯木",
      color: "#008000",
      img: "wood.png",
    },
    巳: {
      name: "巳火",
      color: "#FF0000",
      img: "fire.png",
    },
    午: {
      name: "午火",
      color: "#FF0000",
      img: "fire.png",
    },
    申: {
      name: "申金",
      color: "#FD7C04",
      img: "metal.png",
    },
    酉: {
      name: "酉金",
      color: "#FD7C04",
      img: "metal.png",
    },
    辰: {
      name: "辰土",
      color: "#995001",
      img: "earth.png",
    },
    戌: {
      name: "戌土",
      color: "#995001",
      img: "earth.png",
    },
    丑: {
      name: "丑土",
      color: "#995001",
      img: "earth.png",
    },
    未: {
      name: "未土",
      color: "#995001",
      img: "earth.png",
    },
  },
  getGanzhiWuxingColorInfo(str) {
    if (str && this.ganzhiWuxing[str]) {
      let { name, color, img } = this.ganzhiWuxing[str];
      return {
        name: name,
        color: color,
        img: img
      }      
    }
    return {
      name: "",
      color: "",
      img: ""
    }
  },
  getWuxingColorInfo(str) {
    if (str) {
      let { color, img } = this.wuxing[str];
      return {
        color: color || "",
        img: img || ""
      }      
    }
    return {
      color: "",
      img: ""
    }
  },
  getJiuLongGanzhiWuxingColorInfo(str) {
    if (str && this.jiulongGanzhiWuxing[str]) {
      let { name, color, img } = this.jiulongGanzhiWuxing[str];
      return {
        name: name,
        color: color,
        img: img
      }      
    }
    return {
      name: "",
      color: "",
      img: ""
    }
  },
}