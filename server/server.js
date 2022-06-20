const PROTO = require('../proto/customers.proto');

const {v4 : uuidv4} = require("uuid");

let grpc = require('@grpc/grpc-js');
let protoLoader = require('@grpc/proto-loader')

// sample data
const customers = [
    {
        id: "a68b823c-7ca6-44bc-b721-fb4d5312cafc",
        name: "John Bolton",
        age: 23,
        address: "Address 1"
    },
    {
        id: "34415c7c-f82d-4e44-88ca-ae2a1aaa92b7",
        name: "Mary Anne",
        age: 45,
        address: "Address 2"
    }
]

// proto transcript into a js object
// set its package definitions 
let packageDefinition = protoLoader.loadSync(PROTO, {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true
});

// pass package definition object to loadPackageDefinition 
let customersProto = grpc.loadPackageDefinition(packageDefinition);

// create server
const server = new grpc.Server();

server.addService(customersProto.CustomerService.service, {
    getAll : (_,callback) => {
        callback(null, {customers});
    },

    get: (call, callback) => {
        let customer = customers.find(cus => cus.id == call.request.id);
        if(customer) {
            callback(null,customer);
        }else {
            callback({
                code : grpc.status.NOT_FOUND,
                details: "Not found"
            })
        }
    }
})

server.bindAsync('127.0.0.1:33000', grpc.ServerCredentials.createInsecure(),(err,port)=>{
    console.log("server running at http://127.0.0.1:33000");
    server.start()
})

server.start();