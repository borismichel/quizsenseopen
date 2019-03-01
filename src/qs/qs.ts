import * as myCubes from './qs_cubes';
import * as config from '../config/config';
import * as enigma from 'enigma.js';
import * as schema from 'enigma.js/schemas/12.34.11.json';
import * as webSocket from 'ws';
import * as fs from 'fs';

//get Server Certificates

//Certificate Loader
// const root  = [fs.readFileSync((config.qlikCertificateDir + 'root.pem'))];
// const key   = fs.readFileSync((config.qlikCertificateDir + 'client_key.pem'));
// const client = fs.readFileSync((config.qlikCertificateDir + 'client.pem'));

// session.on('traffic:sent', data => console.log('sent:', data));
// session.on('traffic:received', data => console.log('received:', data));

export function qsPulldata () {

    const session = enigma.create({
        schema,
        url: config.qlikServer,
        createSocket: url => new webSocket(url,{
            // ca: root, < Uncomment when on Server
            // key: key, < Uncomment when on Server
            // cert: client, < Uncomment when on Server
            headers: {
                'X-Qlik-User': config.qlikUser
            },
        })
    });

    return new Promise((resolve, reject) => {
        session.open()
        .then((global) => {
            return global.openDoc(config.qlikApp)
        }).then((app) => {

            //Get Measures
            var p1 = new Promise((resolve, reject) => {
                app.createSessionObject(myCubes.msre).then((obj) => {
    
                    obj.getLayout().then( (layout) => {
                        let idx = Math.ceil(Math.random()*layout.qMeasureList.qItems.length) - 1;
                        resolve([layout.qMeasureList.qItems[idx].qMeta.title.replace('*', ' ').replace('_', ' ').replace('~', ' '), layout.qMeasureList.qItems[idx].qInfo.qId]);
                    }).catch(err => console.log('Rejection: ', err))
    
                }).catch(err => console.log('Rejection: ', err));
    
            }).catch(err => console.log('Rejection: ', err));
    
            //Get Dimesnions
            var p2 = new Promise( (resolve, reject) => {
                app.createSessionObject(myCubes.dims).then((obj) => {
    
                    obj.getLayout().then( (layout) => {
                        let idx = Math.ceil(Math.random()*layout.qDimensionList.qItems.length) - 1;
                        resolve([layout.qDimensionList.qItems[idx].qMeta.title.replace('*', ' ').replace('_', ' ').replace('~', ' '), layout.qDimensionList.qItems[idx].qInfo.qId]);
    
                    }).catch(err => console.log('Rejection: ', err));
    
                }).catch(err => console.log('Rejection: ', err));
    
            }).catch(err => console.log('Rejection: ', err));
            
            //Pass through app object
            var p3 = Promise.resolve(app);
    
            return Promise.all([p1, p2, p3])
        
        }).then((r) => {
                var cResults = r.slice(0,2);
                var app = r[2];
                console.log(cResults);
                
                let hyperCubeDef = myCubes.buildHyperCube(cResults[1][1], cResults[0][1]);
    
                return new Promise((resolve, reject) => {
                    app.createSessionObject(hyperCubeDef).then((obj) => {
                        return obj.getLayout()
                    }).then((layout) => {
                        let idx = Math.round(layout.qHyperCube.qDataPages[0].qMatrix.length * Math.random());
                        cResults.push([layout.qHyperCube.qDataPages[0].qMatrix[idx][0].qText.replace('*', ' ').replace('_', ' ').replace('~', ' '), layout.qHyperCube.qDataPages[0].qMatrix[idx][1].qText])
                        resolve(cResults);
                    })            
                })
                
        }).then((results) => {
            console.log('results: ' + JSON.stringify(results));
            session.close();
            resolve(results);
        })
        .catch(err => console.log('Rejection: ', err))
    })
};