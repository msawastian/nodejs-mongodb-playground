const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');


const data = {
    id: 4
};

let token = jwt.sign(data, '123abc');
console.log(token);

let decoded = jwt.verify(token, '123abc');
console.log(decoded);

// let message = 'Hello world!';
// let hash = SHA256(message).toString();
//
// console.log(message);
// console.log(hash);
//

//
// let token = {
//     data,
//     hash: SHA256(JSON.stringify(data) + 'salt').toString()
// };
//
// const resultHash = SHA256(JSON.stringify(token.data) + 'salt').toString();
//
// if (resultHash === token.hash) {
//     console.log('Data not changed')
// } else {
//     console.log('Data was changed')
// }
