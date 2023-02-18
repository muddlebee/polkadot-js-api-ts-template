// needed as of 7.x series, see CHANGELOG of the api repo.
import '@polkadot/api-augment';
import '@polkadot/types-augment';

import { ApiPromise, WsProvider } from '@polkadot/api';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { BN, formatBalance } from '@polkadot/util';

const optionsPromise = yargs(hideBin(process.argv)).option('endpoint', {
	alias: 'e',
	type: 'string',
	default: 'wss://rpc.polkadot.io',
	description: 'the wss endpoint. It must allow unsafe RPCs.',
	required: true
}).argv;

async function main() {
	const options = await optionsPromise;
	const provider = new WsProvider(options.endpoint);
	const api = await ApiPromise.create({ provider });
// get the api and events at a specific block
//const hasht = '0x7e621cf5b1c8488a1ef321b3a97e98a01e0065b7558ad44bbe0233cc7603f0db';
const hasht = '0xcfbd93385ed4f2bf384c678244074e4ef5d8d818a4113e52a12163410187235e';
const apiAt = await api.at(hasht);
const allRecords = await apiAt.query.system.events();
const signedBlock = await api.rpc.chain.getBlock(hasht);

const chainDecimals = await api.registry.chainDecimals[0];
const unit = await api.registry.chainTokens[0];

/* console.log(chainDecimals);
// map between the extrinsics and events
signedBlock.block.extrinsics.forEach(({ method: { method, section } }, index) => {
  allRecords
    // filter the specific events based on the phase and then the
    // index of our extrinsic in the block
    .filter(({ phase }) =>
      phase.isApplyExtrinsic &&
      phase.asApplyExtrinsic.eq(index)
    )
    // test the events against the specific types we are looking for
    .forEach(({ event }) => {
        
        if(event.method === 'Transfer'){
          if(event.data.hasOwnProperty('amount')){
            console.log(`${section}.${method}:: ExtrinsicSuccess:: ${JSON.stringify(event.toHuman())}`);
            const defaults = formatBalance.getDefaults();
            const free = formatBalance(event.data.amount, {withUnit:unit,decimals:chainDecimals });

            const amount = event.data.amount;
            console.log(`free:::::::::: ${JSON.stringify(free)}`);

            console.log(`amount:::::::::: ${JSON.stringify(toUnit(amount,chainDecimals))}`);
          }
        }

    });
});
}
*/

//fetch extrinsic details from signed block
signedBlock.block.extrinsics.forEach((extrinsic, index) => {

    //filter the specific events based on the phase and then the

  //  console.log(`extrinsic:: ${JSON.stringify(extrinsic.toHuman())}`);

    allRecords
    // filter the specific events based on the phase and then the
    // index of our extrinsic in the block
    .filter(({ phase }) =>
      phase.isApplyExtrinsic &&
      phase.asApplyExtrinsic.eq(index)
    )
    // test the events against the specific types we are looking for
    .forEach(({ event }) => {
      console.log(`event:: ${JSON.stringify(event.toHuman())}`);

     if(event.method === 'Bonded' && event.section === 'staking'){
        if(event.data.hasOwnProperty('amount')){
          console.log(`${extrinsic.section}.${extrinsic.method}:: ExtrinsicSuccess:: ${JSON.stringify(event.toHuman())}`);
          const defaults = formatBalance.getDefaults();
          const free = formatBalance(event.data.amount, {withUnit:unit,decimals:chainDecimals });

       //   console.log("event method" + event.method)
        //   console.log("event section" + event.section)

          const amount = event.data.amount;
   //       console.log(`free:::::::::: ${JSON.stringify(free)}`);

          console.log(`amount:::::::::: ${JSON.stringify(toUnit(amount,chainDecimals))}`);
          console.log(`normal amount:::::::::: ${amount}`);
        }
     }

    });
});


}
main().catch(console.error);
function toUnit(balance, decimals) {
  const base = new BN(10).pow(new BN(decimals));
  const dm = new BN(balance).divmod(base);
  return parseFloat(dm.div.toString() + "." + dm.mod.toString())
} 
