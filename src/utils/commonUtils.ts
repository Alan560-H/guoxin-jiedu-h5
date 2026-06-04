import wuxingColor from '@/utils/wuxing.js'
// 定义返回值类型，增强类型提示
interface FiveElementRes {
	color : string;
	img : string;
	name : string;
}
export class COMUtils {
	public static fiveElementInfo(str : string) : FiveElementRes {
		let {
			color,
			img, name
		} = wuxingColor.getGanzhiWuxingColorInfo(str);
		return {
			color: color,
			img: `/static/bazi/fortune/${img}`,
			name
		};
	}
}