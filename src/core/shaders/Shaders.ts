export class Shaders {
    public static vertexSource: string = `
        attribute vec2 aVertexPosition;
        attribute vec4 aVertexColor;

        uniform vec2 uResolution;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;

        varying lowp vec4 vColor;

        void main() {
            vec2 zeroToOne = aVertexPosition / uResolution;
            vec2 zeroToTwo = zeroToOne * 2.0;
            vec2 clipSpace = zeroToTwo - 1.0;
            gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(clipSpace * vec2(1, -1), 0, 1);
            vColor = aVertexColor;
        }
    `;

    public static fragmentSource: string = `
        varying lowp vec4 vColor;

        void main() {
            gl_FragColor = vColor;
        }
    `;
}