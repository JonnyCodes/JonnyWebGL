export class MathUtil {

    public static getRandInt(min: number = 0, max: number = 1): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min; // Inclusive
    }
}