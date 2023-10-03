import React from 'react';
import { useTheme } from 'next-themes';

const AppLogoSVG = ({ theme }: { theme: string }) => {
    const fillColor = theme === 'dark' ? 'orange' : 'orange'; // Example: Change color based on theme

    return (
        <svg viewBox="0 0 76.65306 25.262392" version="1.1" id="svg445"

            xmlns="http://www.w3.org/2000/svg"
        >

            <defs id="defs442" />
            <g id="layer1" transform="translate(-39.416085,-135.86881)">
                <g id="g505" fill={fillColor}>
                    <g transform="matrix(0.31555111,0,0,0.31555111,36.27004,132.72245)" id="g6"
                        fill={fillColor}>
                        <g id="g4" fill={fillColor}>
                            <path
                                d="M 70.732,33.633 50.431,27.487 c -0.283,-0.086 -0.586,-0.086 -0.869,0 l -20.299,6.146 c -0.633,0.191 -1.065,0.774 -1.065,1.436 0,11.9 0.31,22.351 4.112,29.726 3.738,7.261 9.928,9.568 15.388,11.604 0.591,0.221 1.179,0.439 1.759,0.663 0.174,0.067 0.356,0.101 0.54,0.101 0.183,0 0.366,-0.033 0.539,-0.101 0.579,-0.223 1.166,-0.441 1.756,-0.661 5.463,-2.036 11.654,-4.344 15.394,-11.605 3.803,-7.376 4.112,-17.827 4.112,-29.727 0,-0.662 -0.433,-1.245 -1.066,-1.436 z m -5.713,29.788 c -3.208,6.23 -8.579,8.232 -13.774,10.168 -0.417,0.156 -0.833,0.312 -1.247,0.468 C 49.584,73.9 49.166,73.744 48.748,73.588 43.555,71.651 38.185,69.65 34.978,63.42 31.597,56.862 31.221,47.218 31.2,36.181 l 18.798,-5.692 18.8,5.692 C 68.776,47.219 68.4,56.862 65.019,63.421 Z M 64.934,12.849 c -4.746,-1.91 -9.771,-2.878 -14.935,-2.878 -20.17,0 -37.248,15.072 -39.723,35.057 -0.203,1.634 -0.306,3.308 -0.306,4.974 0,22.071 17.957,40.027 40.029,40.027 22.073,0 40.031,-17.956 40.031,-40.027 0,-16.437 -9.85,-31.02 -25.096,-37.153 z m -14.935,74.18 c -20.418,0 -37.029,-16.61 -37.029,-37.027 0,-1.543 0.095,-3.092 0.284,-4.604 C 15.543,26.912 31.34,12.971 50,12.971 c 4.778,0 9.427,0.896 13.815,2.661 14.103,5.674 23.216,19.165 23.216,34.37 C 87.03,70.419 70.418,87.029 49.999,87.029 Z"
                                id="path2" fill={fillColor}>
                            </path>

                        </g>

                    </g>
                    <g transform="matrix(0.16842013,0,0,0.16842013,37.731883,107.2017)" id="g17" fill={fillColor}>
                        <g transform="translate(197.01,271.45003)" id="g12" fill={fillColor}>
                            <path
                                d="m 1.39,-38.54 c 1.15,1.97 2.14,3.53 2.14,8.86 V -8.86 C 3.53,-3.53 2.54,-1.97 1.39,0 H 25.01 C 23.86,-1.97 22.88,-3.53 22.88,-8.86 V -27.8 c 0,-2.38 0.82,-3.2 3.2,-3.2 h 7.05 c 2.38,0 3.2,0.82 3.2,3.2 v 18.94 c 0,5.33 -0.99,6.89 -2.14,8.86 h 23.62 c -1.15,-1.97 -2.13,-3.53 -2.13,-8.86 v -15.66 c 0,-8.61 -3.77,-14.02 -12.88,-14.02 H 27.14 c -2.87,0 -4.1,2.05 -5,4.02 H 21.98 L 21.4,-38.54 Z M 111.37,0 112.6,-9.76 c -2.05,0.82 -2.87,1.07 -7.79,1.07 H 88.9 l 27.06,-43.79 H 65.7 l -1.48,10.33 c 1.89,-0.98 3.53,-1.64 7.55,-1.64 H 87.59 L 60.61,0 Z m 48.48,-36.98 9.68,-10.33 c 2.78,-2.96 4.51,-3.86 6.88,-5.17 h -18.28 c 0.08,0.66 0.16,1.31 0.16,1.97 0,1.72 -0.49,3.03 -2.79,5.66 l -13.69,15.9 v -14.51 c 0,-5 0.66,-6.97 1.64,-9.02 h -23.29 c 0.99,2.05 1.64,4.02 1.64,9.02 v 34.44 c 0,5 -0.65,6.97 -1.64,9.02 h 23.29 c -0.98,-2.05 -1.64,-4.02 -1.64,-9.02 v -7.87 l 4.76,-5.33 L 158.29,0 h 24.6 c -2.95,-3.12 -5.82,-7.71 -7.62,-10.74 z m 27.08,28.12 c 0,5.33 -0.99,6.89 -2.14,8.86 h 23.62 c -1.15,-1.97 -2.13,-3.53 -2.13,-8.86 v -29.68 h -21.49 c 1.15,1.97 2.14,3.53 2.14,8.86 z m 0.16,-43.62 v 10.17 h 19.02 v -10.17 z m 60.04,41.98 c 0,2.14 -0.82,2.96 -2.71,2.96 h -7.7 c -1.89,0 -2.71,-0.82 -2.71,-2.96 v -17.54 c 0,-2.14 0.82,-2.96 2.71,-2.96 h 7.7 c 1.89,0 2.71,0.82 2.71,2.96 z M 268.12,0 c -0.9,-1.56 -1.64,-3.28 -1.64,-7.22 v -45.26 h -20.99 c 0.9,1.56 1.64,3.28 1.64,7.22 v 10.49 h -0.16 c -0.5,-1.56 -1.48,-3.77 -5.01,-3.77 h -15.17 c -8.85,0 -12.13,4.92 -12.13,11.97 v 14.6 c 0,7.05 3.28,11.97 12.13,11.97 h 16.32 c 2.22,0 3.2,-1.31 4.59,-4.1 l 1.07,4.1 z"
                                id="path10" fill={fillColor}>
                            </path>

                        </g>


                    </g>
                </g>
            </g>
        </svg>
    );
};

export default AppLogoSVG;
