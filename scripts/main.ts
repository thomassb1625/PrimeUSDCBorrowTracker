import { getUSDCBorrows } from "./getUSDCBorrows";


async function main() {
    let contractAddresses = [
    "0x54F967B8a135e44E233dA070eA88C5E4a53BaCAC" //v3.4.0
    ];

    let usdcAddresses = [
      "0x293057519316f71799B2AeC865DB6271A8726303"
    ]

    let deploymentBlocks = [3766081];

    let lastBlock = [0];

    for (let i = 0; i < contractAddresses.length; i++) {
        await getUSDCBorrows(contractAddresses[i], usdcAddresses[i], deploymentBlocks[i], lastBlock[i]);
    }

}

main().catch( e => {
    console.log(e)
})