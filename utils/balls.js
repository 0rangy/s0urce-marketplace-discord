const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const { html2canvas } = require('html2canvas')

const points = [13947, 11743, 396, 345, 257];
const minPoints = points.at(-1);
const maxPoints = points[0];
const minPercent = 20;
const maxPercent = 100;

const percentages = points.map(point => {
    const percentage = ((point - minPoints) / (maxPoints - minPoints)) * (maxPercent - minPercent) + minPercent;
    return percentage.toFixed(4); // Four decimal places
});

const dom = new JSDOM(`<html>

<head>
    <meta charset="utf-8">
    <link rel="icon" href="https://s0urce.io/icons/s0urce.svg">
    <meta name="viewport" content="width=device-width">

    <link href="https://s0urce.io/_app/immutable/assets/0.16a482a1.css" rel="stylesheet">
    <link href="https://s0urce.io/_app/immutable/assets/2.fec49d12.css" rel="stylesheet">
    <link href="https://s0urce.io/_app/immutable/assets/Button.40d6c873.css" rel="stylesheet">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
    <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&amp;family=Open+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&amp;display=swap"
        rel="stylesheet">
</head>

<body>
    <div
        style="position: absolute; width: 300px; right: 10px; bottom: 10px; background-color: var(--color-dark); padding: 10px; border-radius: 4px;">
        <div style="display: flex; align-items: center;">
            <div style="flex: 1 1 0%;">
                <h4 class="countrywarsstats-title svelte-1azjldn"><img src="https://s0urce.io/icons/countryWars.svg" class="icon"> Country
                    Wars Stats
                    <span style="color: var(--color-lightgrey); font-size: 14px;">(today)</span>
                </h4>
            </div> <button class="countrywarsstats-close svelte-1azjldn"><img draggable="false" class="icon"
                    src="https://s0urce.io/icons/arrow-down.svg" alt="Close Icon"></button>
        </div>
        <div
            style="width: 100%; height: 120px; display: flex; align-items: flex-end; justify-content: space-around; border-left: 1px solid grey; border-bottom: 1px solid grey; margin-top: 10px;">
            <div
                style="position: relative; width: 40px; height: 100%; background-color: var(--color-blue); border-top-left-radius: 4px; border-top-right-radius: 4px;">
                <div style="position: absolute; width: 100%; text-align: center; top: 5px;">
                    <div><img class="icon flag svelte-10h13dd" src="https://s0urce.io/flags/AQ.svg" alt="AQ Flag"></div>
                    <div style="font-size: 12px; font-weight: 500;">13947</div>
                </div>
            </div>
            <div
                style="position: relative; width: 40px; height: 87.1205%; background-color: var(--color-blue); border-top-left-radius: 4px; border-top-right-radius: 4px;">
                <div style="position: absolute; width: 100%; text-align: center; top: 5px;">
                    <div><img class="icon flag svelte-10h13dd" src="https://s0urce.io/flags/FR.svg" alt="FR Flag"></div>
                    <div style="font-size: 12px; font-weight: 500;">11743</div>
                </div>
            </div>
            <div
                style="position: relative; width: 40px; height: 20.8123%; background-color: var(--color-blue); border-top-left-radius: 4px; border-top-right-radius: 4px;">
                <div style="position: absolute; width: 100%; text-align: center; top: -20px;">
                    <div><img class="icon flag svelte-10h13dd" src="https://s0urce.io/flags/BE.svg" alt="BE Flag"></div>
                    <div style="font-size: 12px; font-weight: 500;">396</div>
                </div>
            </div>
            <div
                style="position: relative; width: 40px; height: 20.5142%; background-color: var(--color-blue); border-top-left-radius: 4px; border-top-right-radius: 4px;">
                <div style="position: absolute; width: 100%; text-align: center; top: -20px;">
                    <div><img class="icon flag svelte-10h13dd" src="https://s0urce.io/flags/RU.svg" alt="RU Flag"></div>
                    <div style="font-size: 12px; font-weight: 500;">345</div>
                </div>
            </div>
            <div
                style="position: relative; width: 40px; height: 20%; background-color: var(--color-blue); border-top-left-radius: 4px; border-top-right-radius: 4px;">
                <div style="position: absolute; width: 100%; text-align: center; top: -20px;">
                    <div><img class="icon flag svelte-10h13dd" src="https://s0urce.io/flags/CA.svg" alt="CA Flag"></div>
                    <div style="font-size: 12px; font-weight: 500;">257</div>
                </div>
            </div>
        </div>
        <div style="margin-top: 10px;">
            <h4 style="margin-bottom: 5px;">Your Stats</h4>
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <div style="display: flex; width: 100%;">
                    <div style="flex: 1 1 0%; font-weight: 600;"><img class="icon flag svelte-10h13dd"
                            src="https://s0urce.io/flags/BE.svg" alt="BE Flag"> Belgium</div> <span
                        style="color: var(--color-lightgrey); font-weight: 500;">1526</span>
                </div>
                <div style="display: flex; width: 100%;">
                    <div style="flex: 1 1 0%; font-weight: 600;"><img src="icons/countryWars.svg" class="icon">
                        Your CWPs</div> <span style="color: var(--color-lightgrey); font-weight: 500;">1075</span>
                </div>
                <div style="display: flex; width: 100%;">
                    <div style="flex: 1 1 0%; font-weight: 600;"><img src="icons/hack-red.svg" class="icon"> No hack yet
                    </div> <span style="color: var(--color-midgreen); font-weight: 500;">+1</span>
                </div>
            </div>
        </div>
    </div>
</body>

</html>`);

console.log((await html2canvas.default(dom.querySelector("body > div:nth-child(1) > main:nth-child(1) > div:nth-child(4) > div:nth-child(2)"))).toDataURL())