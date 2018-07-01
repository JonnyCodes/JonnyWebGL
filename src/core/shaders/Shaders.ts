export class Shaders {
    public static vertexSource: string = `
        attribute vec2 aVertexPosition;
        attribute vec2 aTextureCoord;

        uniform vec2 uResolution;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;

        varying highp vec2 vTextureCoord;

        void main() {
            vec2 zeroToOne = aVertexPosition / uResolution;
            vec2 zeroToTwo = zeroToOne * 2.0;
            vec2 clipSpace = zeroToTwo - 1.0;
            gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(clipSpace * vec2(1, -1), 0, 1);
            vTextureCoord = aTextureCoord;
        }
    `;

    public static fragmentSource: string = `
        precision mediump float;

        uniform sampler2D uImage;

        varying vec2 vTextureCoord;

        void main() {
            gl_FragColor = texture2D(uImage, vTextureCoord);
        }
    `;
}