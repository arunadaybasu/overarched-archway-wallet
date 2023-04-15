require('es6-promise/auto');

import { SigningArchwayClient } from '@archwayhq/arch3.js';
import ChainInfo from './constantine.config.js';
import { GasPrice } from "@cosmjs/stargate";
import './css/style.css';

document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.collapsible');
    var instances = M.Collapsible.init(elems, {
        accordion: true
    });
});


window.onload = async () => {
    if (!window.getOfflineSigner || !window.keplr) {
        alert("Please install keplr extension");
    } else {
        if (window.keplr.experimentalSuggestChain) {
            try {
                await window.keplr.experimentalSuggestChain(ChainInfo);
            } catch {
                alert("Failed to suggest the chain");
            }
        } else {
            alert("Please use the recent version of keplr extension");
        }
    }

    const chainId = ChainInfo.chainId;

    await window.keplr.enable(chainId);

    const offlineSigner = window.keplr.getOfflineSigner(chainId);

    const accounts = await offlineSigner.getAccounts();

    const signingClient = await SigningArchwayClient.connectWithSigner(ChainInfo.rpc, offlineSigner, {
        gasPrice: GasPrice.fromString('0.02uconst'),
    });

    const balances = await signingClient.getBalance(accounts[0].address, 'uconst');
    console.log(balances);

    const divres = document.getElementById('span-balance');
    divres.innerHTML = (balances.amount/1000000) + ' $CONST';

    /**await window.keplr.enable(ChainInfo.chainId);

    const offlineSigner = window.keplr.getOfflineSigner(ChainInfo.chainId);

    const accounts = await offlineSigner.getAccounts();

    const signingClient = await SigningArchwayClient.connectWithSigner(ChainInfo.rpc, offlineSigner, {
        gasPrice: GasPrice.fromString('0.02uconst'),
    });**/

    // console.log(accounts);

        const allTxns = await signingClient.searchTx({ sentFromOrTo: accounts[0].address });
        // console.log(allTxns);
        // const events = JSON.parse(unescape(allTxns[0].rawLog));
        // console.log(events[0]);

        var i, j, eventsTemp, liTemp;
        const txnList1 = document.getElementById("txn-list-1");

        for (i = 0; i < allTxns.length; i++) {

            eventsTemp = JSON.parse(unescape(allTxns[i].rawLog));
            eventsTemp = eventsTemp[0].events;

            // console.log(eventsTemp[3].attributes);
            console.log((eventsTemp[3].attributes[2].value.split('uconst')[0])/1000000);

            liTemp = document.createElement("li");

            if (eventsTemp[3].attributes[1].value == accounts[0].address) {
                liTemp.innerHTML = 
                '<div class="collapsible-header">\
                    <i class="material-icons red-text">call_made</i>\
                    ' + ((eventsTemp[3].attributes[2].value.split('uconst')[0])/1000000) + ' $CONST\
                </div>\
                <div class="collapsible-body">\
                    <p class="red-text">SENT (DEBIT)</p>\
                    <p>Amount: ' + ((eventsTemp[3].attributes[2].value.split('uconst')[0])/1000000) + ' $CONST</p>\
                    <p>Sender (YOU): ' + eventsTemp[3].attributes[1].value + '</p>\
                    <p>Receiver: ' + eventsTemp[3].attributes[0].value + '</p>\
                </div>';
            } else {
                liTemp.innerHTML = 
                '<div class="collapsible-header">\
                    <i class="material-icons green-text">call_received</i>\
                    ' + ((eventsTemp[3].attributes[2].value.split('uconst')[0])/1000000) + ' $CONST\
                </div>\
                <div class="collapsible-body">\
                    <p class="green-text">RECEIVED (CREDIT)</p>\
                    <p>Amount: ' + ((eventsTemp[3].attributes[2].value.split('uconst')[0])/1000000) + ' $CONST</p>\
                    <p>Receiver (YOU): ' + eventsTemp[3].attributes[0].value + '</p>\
                    <p>Sender: ' + eventsTemp[3].attributes[1].value + '</p>\
                </div>';
            }
            
            txnList1.appendChild(liTemp);

        }
};

document.sendForm.onsubmit = () => {
    const recipient = document.sendForm.recipient.value;

    let amount = document.sendForm.amount.value;
    amount = parseFloat(amount);
    if (isNaN(amount)) {
        alert("Invalid amount");
        return false;
    }

    amount *= 1000000;
    amount = Math.floor(amount);

    (async () => {
        const chainId = ChainInfo.chainId;

        await window.keplr.enable(chainId);

        const offlineSigner = window.keplr.getOfflineSigner(chainId);

        const accounts = await offlineSigner.getAccounts();

        const signingClient = await SigningArchwayClient.connectWithSigner(ChainInfo.rpc, offlineSigner, {
            gasPrice: GasPrice.fromString('0.02uconst'),
        });

        /**const client = await SigningStargateClient.connectWithSigner(
            ChainInfo.rpc,
            offlineSigner
        );**/

        const amountFinal = {
            denom: 'uconst',
            amount: amount.toString(),
        }

        const fee = {
            amount: [{
                denom: 'uconst',
                amount: '5000',
            }, ],
            gas: '200000',
        }

        const memo = "Transfer token to another account";
        const msgSend = {
            fromAddress: accounts[0].address,
            toAddress: recipient,
            amount: [amountFinal],
        };

        const msgAny = {
            typeUrl: "/cosmos.bank.v1beta1.MsgSend",
            value: msgSend,
        };

        /**const signedTx = await client.signAndBroadcast(accounts[0].address, [msgAny], fee, memo);

        console.log(signedTx);**/

        const broadcastResult = await signingClient.signAndBroadcast(
            accounts[0].address,
            [msgAny],
            fee,
            memo, // optional
        );

        if (broadcastResult.code !== undefined &&
            broadcastResult.code !== 0) {
            alert("Failed to send tx: " + broadcastResult.log || broadcastResult.rawLog);
        } else {
            alert("Succeed to send tx:" + broadcastResult.transactionHash);
        }
    })();

    return false;
};

// document.getElementById('add-account').onclick = () => {

//     (async () => {
//         const chainId = ChainInfo.chainId;

//         await window.keplr.enable(chainId);

//         const offlineSigner = window.keplr.getOfflineSigner(chainId);

//         const accounts = await offlineSigner.getAccounts();

//         const signingClient = await SigningArchwayClient.connectWithSigner(ChainInfo.rpc, offlineSigner, {
//             gasPrice: GasPrice.fromString('0.02uconst'),
//         });

//         // console.log(accounts);

//         const allTxns = await signingClient.searchTx({ sentFromOrTo: accounts[0].address });
//         // console.log(allTxns);
//         // const events = JSON.parse(unescape(allTxns[0].rawLog));
//         // console.log(events[0]);

//         var i, j, eventsTemp, liTemp;
//         const txnList1 = document.getElementById("txn-list-1");

        

//         for (i = 0; i < allTxns.length; i++) {

//             eventsTemp = JSON.parse(unescape(allTxns[i].rawLog));
//             eventsTemp = eventsTemp[0].events;

//             console.log(eventsTemp[3].attributes);
//             // console.log(eventsTemp[3].attributes[0].value);

//             liTemp = document.createElement("li");

//             if (eventsTemp[3].attributes[1].value == accounts[0].address) {
//                 liTemp.innerHTML = 
//                 '<div class="collapsible-header">\
//                     <i class="material-icons red-text">call_made</i>\
//                     ' + eventsTemp[3].attributes[2].value + ' $CONST\
//                 </div>\
//                 <div class="collapsible-body">\
//                     <p class="red-text">SENT (DEBIT)</p>\
//                     <p>Amount: ' + eventsTemp[3].attributes[2].value + '</p>\
//                     <p>Sender: ' + eventsTemp[3].attributes[1].value + '</p>\
//                     <p>Receiver: ' + eventsTemp[3].attributes[0].value + '</p>\
//                 </div>';
//             } else {
//                 liTemp.innerHTML = 
//                 '<div class="collapsible-header">\
//                     <i class="material-icons green-text">call_received</i>\
//                     ' + eventsTemp[3].attributes[2].value + ' $CONST\
//                 </div>\
//                 <div class="collapsible-body">\
//                     <p class="red-text">SENT (DEBIT)</p>\
//                     <p>Amount: ' + eventsTemp[3].attributes[2].value + '</p>\
//                     <p>Sender: ' + eventsTemp[3].attributes[1].value + '</p>\
//                     <p>Receiver: ' + eventsTemp[3].attributes[0].value + '</p>\
//                 </div>';
//             }
            
//             txnList1.appendChild(liTemp);

//         }

//         // var elems = document.querySelectorAll('.collapsible');
//         // var instances = M.Collapsible.init(elems, {
//         //     accordion: true
//         // });

//         // const divres = document.getElementById('add-account-result');
//         // divres.innerHTML = (balances.amount/1000000) + ' $CONST';

//     })();

// };


// document.getElementById('balance').onclick = () => {

//     (async () => {
//         const chainId = ChainInfo.chainId;

//         await window.keplr.enable(chainId);

//         const offlineSigner = window.keplr.getOfflineSigner(chainId);

//         const accounts = await offlineSigner.getAccounts();

//         const signingClient = await SigningArchwayClient.connectWithSigner(ChainInfo.rpc, offlineSigner, {
//             gasPrice: GasPrice.fromString('0.02uconst'),
//         });

//         const balances = await signingClient.getBalance(accounts[0].address, 'uconst');
//         console.log(balances);

//         const divres = document.getElementById('balance-result');
//         divres.innerHTML = (balances.amount/1000000) + ' $CONST';

//     })();

//     return false;
// };

