const hapi = require('@hapi/hapi');
//const H2o2 = require('@hapi/h2o2');
var express = require('express');
const AuthBearer = require('hapi-auth-bearer-token');

var express = require('express');
const Joi = require('joi');
const axios = require('axios');
const FormData = require('form-data');

const AgentStatus = require('./respository/AgentStatus');
const Inbound = require('./respository/Inbound');
const Outbound = require('./respository/Outbound');
const OnlineAgent = require('./respository/OnlineAgent');
const Satisfaction = require('./respository/Satisfaction');

const env = require('./env.js');

//---------------- Websocket -----------------------------
const hapiPort = 3200;
const webSocketPort = 3201;
const webPort = 3280;

var url = require('url');

//init Express
var app = express();
//init Express Router
var router = express.Router();

//REST route for GET /status
router.get('/status', function (req, res) {
    res.json({
        status: 'App is running!'
    });
});

//connect path to router
app.use("/", router);

//add middleware for static content
app.use(express.static('static'))
var webserver = app.listen(webPort, function () {
    console.log('Websockets listening on port: ' + webSocketPort);
    console.log('Webserver running on port: ' + webPort)
})

//var env = process.env.NODE_ENV || 'development';
//var env = process.env.NODE_ENV || 'production';

console.log('Running Environment: ' + env);

const init = async () => {

    const server = hapi.Server({
        port: hapiPort,
        host: '0.0.0.0',
        routes: {
            cors: true
        }
    });

    server.route({
        method: "GET",
        path: "/api/v1/",
        handler: () => {
            return '<h3> Welcome to CE Reform API V1.0.0</h3>';
        }
    });

    //API: http://localhost:3000/getOnlineAgentByAgentCode?agentcode=08926
    server.route({
        method: 'GET',
        path: '/api/v1/agents',
        handler: async function (request, reply) {
            var param = request.query;
            const agent_code = param.agent_code;

            try {

                const responsedata = await OnlineAgent.OnlineAgentRepo.getOnlineAgentByAgentCode(agent_code);
                if (responsedata.error) {
                    return responsedata.errMessage;
                } else {
                    return responsedata;
                }
            } catch (err) {
                server.log(["error", "home"], err);
                return err;
            }
        }
    });

    //API: http://localhost:3000/getOnlineAgentByAgentCode?agentcode=08926
    server.route({
        method: 'POST',
        path: '/api/v1/agent',
        config: {
            payload: {
                multipart: true,
                //output: 'stream',
                //parse: true,
                //allow: ['application/json', 'multipart/form-data',  'application/x-www-form-urlencoded'],
                //timeout: false
            },
            // auth: {
            //     strategy: 'jwt-strict',
            //     mode: 'required'
            // },
            cors: {
                origin: ['*'],
                additionalHeaders: ['cache-control', 'x-requested-width']
            }
        },
        handler: async function (request, reply) {
            try {

                const {
                    agent_code,
                    IsLogin
                } = request.payload;
                //console.log('HAPI ', request.payload);
                //console.log('agent_code is: ', agent_code);
                //console.log('IsLogin is: ', IsLogin);


                if (IsLogin === '1') {

                    const responsedata = await OnlineAgent.OnlineAgentRepo.insertOnlineAgent(agent_code);
                    if (responsedata.error) {
                        return responsedata.errMessage;
                    } else {
                        return responsedata;
                    }

                } else if (IsLogin === '0') {

                    const responsedata = await OnlineAgent.OnlineAgentRepo.deleteOnlineAgent(agent_code);
                    if (responsedata.error) {
                        return responsedata.errMessage;
                    } else {
                        return responsedata;
                    }

                } else {


                    return ({
                        statusCode: 400,
                        returnCode: 13,
                        message: 'Invalid IsLogin Code',
                    });


                }

            } catch (err) {
                server.log(["error", "home"], err);
                return err;
            }
        }
    });


    //API: http://localhost:3000/getOnlineAgentByAgentCode?agentcode=08926
    server.route({
        method: 'POST',
        path: '/api/v1/agentstatus',
        config: {
            payload: {
                multipart: true,
                //output: 'stream',
                //parse: true,
                //allow: ['application/json', 'multipart/form-data',  'application/x-www-form-urlencoded'],
                //timeout: false
            },
            // auth: {
            //     strategy: 'jwt-strict',
            //     mode: 'required'
            // },
            cors: {
                origin: ['*'],
                additionalHeaders: ['cache-control', 'x-requested-width']
            }
        },
        handler: async function (request, reply) {
            try {

                const {
                    agent_code,
                    agent_status
                } = request.payload;


                const responsedata = await AgentStatus.AgentStatusRepo.setAgentStatus(agent_code, agent_status);
                if (responsedata.error) {
                    return responsedata.errMessage;
                } else {
                    return responsedata;
                }

            } catch (err) {
                server.log(["error", "home"], err);
                return err;
            }
        }
    });


    //API: http://localhost:3000/getOnlineAgentByAgentCode?agentcode=08926
    server.route({
        method: 'GET',
        path: '/api/v1/agentbyteam',
        config: {
            // auth: {
            //     strategy: 'jwt-strict',
            //     mode: 'required'
            // },
            cors: {
                origin: ['*'],
                additionalHeaders: ['cache-control', 'x-requested-width']
            }
        },
        handler: async function (request, reply) {
            var param = request.query;
            const team_code = param.team_code;

            try {

                const responsedata = await AgentStatus.AgentStatusRepo.getAgentByTeam(team_code);
                if (responsedata.error) {
                    return responsedata.errMessage;
                } else {
                    return responsedata;
                }

            } catch (err) {
                server.log(["error", "home"], err);
                return err;
            }
        }
    });

    //API: http://localhost:3000/getOnlineAgentByAgentCode?agentcode=08926
    server.route({
        method: 'POST',
        path: '/api/v1/outbound',
        config: {
            payload: {
                multipart: true,
                //output: 'stream',
                //parse: true,
                //allow: ['application/json', 'multipart/form-data',  'application/x-www-form-urlencoded'],
                //timeout: false
            },
            // auth: {
            //     strategy: 'jwt-strict',
            //     mode: 'required'
            // },
            cors: {
                origin: ['*'],
                additionalHeaders: ['cache-control', 'x-requested-width']
            }
        },
        handler: async function (request, reply) {
            try {

                const {
                    agent_code,
                    customer_number
                } = request.payload;

                const responsedata = await Outbound.OutboundRepo.setOutboundCall(agent_code, customer_number);
                if (responsedata.error) {
                    return responsedata.errMessage;
                } else {
                    return responsedata;
                }

            } catch (err) {
                server.log(["error", "home"], err);
                return err;
            }
        }
    });

    //API: http://localhost:3000/getOnlineAgentByAgentCode?agentcode=08926
    server.route({
        method: 'GET',
        path: '/api/v1/getoutbound',
        config: {
            // auth: {
            //     strategy: 'jwt-strict',
            //     mode: 'required'
            // },
            cors: {
                origin: ['*'],
                additionalHeaders: ['cache-control', 'x-requested-width']
            }
            // validate: { 
            //   params: Joi.object({ 
            //     name: Joi.string().alphanum().required() 
            //   }) 
            // }  

        },
        handler: async function (request, reply) {
            var param = request.query;
            const uuid = param.uuid;

            try {
                const responsedata = await Outbound.OutboundRepo.getOutboundCall(uuid);
                if (responsedata.error) {
                    return responsedata.errMessage;
                } else {
                    return responsedata;
                }

            } catch (err) {
                server.log(["error", "home"], err);
                return err;
            }
        }
    });

    //API: http://localhost:3000/getOnlineAgentByAgentCode?agentcode=08926
    server.route({
        method: 'GET',
        path: '/api/v1/inbound',
        config: {
            // auth: {
            //     strategy: 'jwt-strict',
            //     mode: 'required'
            // },
            cors: {
                origin: ['*'],
                additionalHeaders: ['cache-control', 'x-requested-width']
            }
        },
        handler: async function (request, reply) {

            var param = request.query;
            const customer_number = param.customer_number;

            try {

                //const { agent_code, customer_number } = request.payload;

                console.log('customer_number : ', customer_number);

                const responsedata = await Inbound.InboundRepo.setInboundCall(customer_number);
                if (responsedata.error) {
                    return responsedata.errMessage;
                } else {
                    //return responsedata;

                    console.log('responsedata: ', responsedata);

                    //http://10.22.192.36:8080/buzz_power/backend/web/telephony/callin/get-call-history?
                    //caller_id=0910941529&call_refer_id=1111&ivr_number=1

                    const caller_id = responsedata.inbound_customer_number
                    const ivr_number = responsedata.ivr_number
                    const call_refer_id = responsedata.inbound_callref

                    if (env == 'development') {
                        //-- For POC --
                        return responsedata;
                        //return reply.redirect('http://128.199.188.223:3200/agents?caller_id=' + caller_id + '&call_refer_id=' + call_refer_id + '&ivr_number=' + ivr_number);
                    } else
                        if (env == 'production') {
                            //-- For PRODUCTION ---
                            return reply.redirect('http://10.22.192.36:8080/buzz_power/backend/web/telephony/callin/get-call-history?caller_id=' + caller_id + '&call_refer_id=' + call_refer_id + '&ivr_number=' + ivr_number);
                        }

                }


            } catch (err) {
                server.log(["error", "home"], err);
                return err;
            }
        }
    });


    //API: http://localhost:3000/getOnlineAgentByAgentCode?agentcode=08926
    server.route({
        method: 'POST',
        path: '/api/v1/setavgwaitingtime',
        config: {
            // auth: {
            //     strategy: 'jwt-strict',
            //     mode: 'required'
            // },
            cors: {
                origin: ['*'],
                additionalHeaders: ['cache-control', 'x-requested-width']
            }
        },
        handler: async function (request, reply) {
            try {

                const responsedata = await Inbound.InboundRepo.setAvgWaitingTime();
                if (responsedata.error) {
                    return responsedata.errMessage;
                } else {
                    console.log('responsedata: ', responsedata);
                    return responsedata;
                }

            } catch (err) {
                server.log(["error", "home"], err);
                return err;
            }
        }
    });


    //API: http://localhost:3000/getOnlineAgentByAgentCode?agentcode=08926
    server.route({
        method: 'GET',
        path: '/api/v1/getsatisfactionscore',
        config: {
            // auth: {
            //     strategy: 'jwt-strict',
            //     mode: 'required'
            // },
            cors: {
                origin: ['*'],
                additionalHeaders: ['cache-control', 'x-requested-width']
            }
        },
        handler: async function (request, reply) {

            try {

                const responsedata = await Satisfaction.SatisfactionRepo.getAverageSatisfactionScore();
                if (responsedata.error) {
                    return responsedata.errMessage;
                } else {
                    //return responsedata;

                    console.log('responsedata: ', responsedata);

                    return responsedata;

                }


            } catch (err) {
                server.log(["error", "home"], err);
                return err;
            }
        }
    });

    //API: http://localhost:3000/getOnlineAgentByAgentCode?agentcode=08926
    server.route({
        method: 'GET',
        path: '/api/v1/getaveragewaitingtime',
        config: {
            // auth: {
            //     strategy: 'jwt-strict',
            //     mode: 'required'
            // },
            cors: {
                origin: ['*'],
                additionalHeaders: ['cache-control', 'x-requested-width']
            }
        },
        handler: async function (request, reply) {

            try {

                const responsedata = await Satisfaction.SatisfactionRepo.getAverageWaitingTime();
                if (responsedata.error) {
                    return responsedata.errMessage;
                } else {
                    //return responsedata;

                    console.log('responsedata: ', responsedata);

                    return responsedata;

                }


            } catch (err) {
                server.log(["error", "home"], err);
                return err;
            }
        }
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);

};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();

//--- Schedule setAvgWaitingTime API Call every 15 minutes -----

// var schedule = require('node-schedule');
// var request = require('request');

// var serverUrl = 'http://localhost:3200/api';

// schedule.scheduleJob('*/15 * * * *', function () {
//     var options = {
//         url: serverUrl + '/setavgwaitingtime',
//         /*
//         headers: {
//             'X-Parse-Application-Id': appID,
//             'X-Parse-Master-Key': masterKey,
//             'Content-Type': 'application/json'
//         }
//         */
//     };
//     request.post(options, function (error, response, body) {
//         if (!error && response.statusCode == 200) {
//             //console.log(body);
//             console.log("Call setAvgWaitingTime API OK!!");
//         } else
//             console.log("Call setAvgWaitingTime API ERROR!!");
//     });

// });

//-----------------------