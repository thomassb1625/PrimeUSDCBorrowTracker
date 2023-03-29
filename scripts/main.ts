import { getUSDCBorrows } from "./getUSDCBorrows";


async function main() {
    let contractAddresses = [
    "0x54F967B8a135e44E233dA070eA88C5E4a53BaCAC", //v3.4.0
    "0xd9753C53b4eA7F6686DFE40bD7EAebA38bC47A7e"
    ];

    let usdcAddresses = [
      "0x293057519316f71799B2AeC865DB6271A8726303",
      "0xF9B80ec25A548b77611b9f158DA6A06649e96d79"
    ]

    let deploymentBlocks = [3766081, 3913762];

    let lastBlock = [0, 0];

    for (let i = 0; i < contractAddresses.length; i++) {
        await getUSDCBorrows(contractAddresses[i], usdcAddresses[i], deploymentBlocks[i], lastBlock[i]);
    }

}

main().catch( e => {
    console.log(e)
})