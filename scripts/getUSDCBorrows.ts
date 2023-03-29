const ethers = require('ethers');
const fs = require('fs');
const masterStateAbi = require('../ABIs/MasterState.json');

let startBlock = 3895179;
const topic = ethers.utils.id('LoanApproved(address,uint256,uint256,uint256,address,uint256)');
const intrfc =  new ethers.utils.Interface(masterStateAbi);
const moonbaseChainId = 1287;

export async function getUSDCBorrows(contractAddr: string, usdcAddr: string, deploymentBlock: number, endBlock: number) {

    let providerRPC = {
        moonbase: {
        name: 'moonbase-alpha',
        rpc: 'https://rpc.api.moonbase.moonbeam.network',
        chainId: 1287,
        },
    };

    let provider = new ethers.providers.StaticJsonRpcProvider(
        providerRPC.moonbase.rpc,
        {
            chainId: providerRPC.moonbase.chainId,
            name: providerRPC.moonbase.name,
    });

    let users: string[] = new Array();

    if (deploymentBlock > startBlock) startBlock = deploymentBlock;

    let i = startBlock;

    try {
        let lastUserData = JSON.parse(await fs.readFileSync('data/liveUserData.json'));
        console.log("Found file");
        //i = lastUserData[0].latestBlockNumber;
        users = lastUserData[1].users;
    } catch (e) {
        console.log("Error downloading file, continuing with rewrite");
        console.log(e);
    }

    if (endBlock == 0) {
        endBlock = await provider.getBlockNumber();
    }

    let rawLogs: Array<any> = new Array();

    let errCount = 0;

    while (i < endBlock) {
        console.log("Retrieving logs from block " + i);

        try {
            let newLogs: Array<any> = await provider.getLogs({
                address: contractAddr,
                topics: [topic],
                fromBlock: i,
                toBlock: (i + 2048) < endBlock ? (i + 2048) : endBlock
            });
            rawLogs = rawLogs.concat(newLogs);

            i += 2048;
            errCount = 0;
        } catch (e) {
            console.log("Error getting users from blocks " + i + " to " + (i + 2048) + " due to:");
            console.log(e);

            errCount += 1;

            if (errCount < 3) {
                console.log("Attempting retry number: " + errCount);
            } else {
                console.log("Failed too many times after " + errCount + " attempts, continuing with parsing");
                i += 2048;
            }

        }
    }

    let userData:Object[] = new Array();

    userData.push({latestBlockNumber: endBlock});

    console.log("Parsing logs...");

    rawLogs.forEach((log) => {
        let parsedLog = intrfc.parseLog(log);
        let user = parsedLog.args[0];
        let loanAsset = parsedLog.args[4];
        let loanAssetChainId = parseInt(parsedLog.args[5]._hex, 16);
        if(users.indexOf(user) === -1 &&
            ethers.utils.isAddress(user) &&
            loanAssetChainId == moonbaseChainId &&
            usdcAddr == loanAsset) users.push(user);
    });

    userData.push({users: users});

    fs.writeFileSync('data/liveUserData.json', JSON.stringify(userData));
    fs.writeFileSync('data/users_' + endBlock + '.json', JSON.stringify(userData));

    console.log("Wrote user data to bucket");
}