const Promise = require('promise');
const btoa = require('btoa');
const httpClient = require('superagent');

exports.getAccessToken = () => {
  const clientId = process.env.SBANKEN_CLIENT_ID || 'clientId';
  const secret = process.env.SBANKEN_SECRET || '1337';
  const identityServer = 'https://auth.sbanken.no/identityserver/connect/token';
  const basicAuth = btoa(clientId + ':' + secret);

  const promise = new Promise(function(resolve, reject) {
    console.log('sbanken : getting access token');
    httpClient
        .post(identityServer)
        .send('grant_type=client_credentials')
        .set('Authorization', 'Basic '+basicAuth)
        .set('Accept', 'application/json')
        .end(function(err, res) {
          if (err || !res.ok) {
            console.log(err);
            reject();
          } else {
            resolve(res.body);
          }
        });
  });
  return promise;
};

exports.getAccountDetails = (token) => {
  const ssn = process.env.SSN || '12345678910';
  const accountServiceUrl = 'https://api.sbanken.no/Bank/api/v1/Accounts/';
  const accountId = process.env.ACCOUNT_ID || '007';
  const promise = new Promise(function(resolve, reject) {
    httpClient
        .get(accountServiceUrl)
        .set('Authorization', 'Bearer '+token)
        .set('Accept', 'application/json')
        .set('customerId', ssn)
        .end(function(err, res) {
          if (err || !res.ok) {
            console.log(err);
            reject();
          } else {
            const accounts = res.body.items;

            const accountList = [];

            for (const x in accounts) {
              if ( x != null) {
                accountList.push(accounts[x]);
              }
            }
            const filteredList = accountList.filter(function(account) {
              return account.accountId == accountId;
            });

            if ( filteredList != null && filteredList[0] != null) {
              const savingAccount = {
                name: filteredList[0].name,
                balance: filteredList[0].balance,
              };
              resolve(savingAccount);
            }
          }
        });
  });
  return promise;
};