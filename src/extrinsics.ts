// needed as of 7.x series, see CHANGELOG of the api repo.
import '@polkadot/api-augment';
import '@polkadot/types-augment';

import { ApiPromise, WsProvider } from '@polkadot/api';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const optionsPromise = yargs(hideBin(process.argv)).option('endpoint', {
	alias: 'e',
	type: 'string',
	default: 'wss://polkadot.api.onfinality.io/public-ws',
	description: 'the wss endpoint. It must allow unsafe RPCs.',
	required: true
}).argv;

async function main() {
	const options = await optionsPromise;
	const provider = new WsProvider(options.endpoint);
	const api = await ApiPromise.create({ provider });
// get the api and events at a specific block
const hasht = '0x7e621cf5b1c8488a1ef321b3a97e98a01e0065b7558ad44bbe0233cc7603f0db';
const apiAt = await api.at(hasht);
const allRecords = await apiAt.query.system.events();
const signedBlock = await api.rpc.chain.getBlock(hasht);

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
        
        if(method === 'transfer'){
          console.log(`${section}.${method}:: ExtrinsicSuccess:: ${JSON.stringify(event.toHuman())}`);
          if(event.data.hasOwnProperty('amount')){
            console.log(`data:: ${JSON.stringify(event.data)}`);
          }
        }

    });
});
}

main().catch(console.error);
