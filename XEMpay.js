console.log("\n");
console.log("==============================================================");
console.log("======== XEMpay - Automated Multisignature Initiator ========");
console.log("==============================================================");
console.log("\n");
var fs = require('fs');

//Check access.json
if (fs.existsSync('./SENDaccess.json')) {
console.log("Enter a password to encrypt SENDaccess.json:");
var SecureConf = require('secure-conf');
var sconf = new SecureConf();
//Encryption

sconf.encryptFile(
"./SENDaccess.json",
"./SENDaccess.json.enc",
function(err, f, ef, ec) {
if (err) {
console.log("failed to encrypt %s, error is %s", f, err);
} else {
console.log("\n");
console.log("encrypt %s to %s complete.", f, ef);
console.log("encrypted contents are %s", ec);
console.log("\n");
console.log("NOW DELETE SENDaccess.json, EMPTY YOUR BIN AND RESTART XEMpay");
console.log("\n");
}
}
);
}
else{
console.log("Enter your password to start XEMpay:");
var SecureConf = require('secure-conf');
var sconf = new SecureConf();
var ef = "./SENDaccess.json.enc";
var express = require('express');
var app = express();

//Decryption
sconf.decryptFile(ef, function(err, file, content) {
if (err) {
console.log("Wrong password !"); //Not showing up... But big error log. Program stop.
// console.log('Failed to decrypt %s, error is %s', file, err);
	} else {
	console.log("\n");
	console.log("decrypt %s complete.", file);
	}

	//Parsing decrypted content
	var auth = JSON.parse(content);
	var _DBhost = auth.DBhost; //
	var _DBpassword = auth.DBpassword; //
	var _DBuser = auth.DBuser; //
	var _database = auth.database; //
	var _wallet = auth.wallet; //
	var _password = auth.walletPassword; //
	var _type = auth.type; //
	var _account = auth.account; //
	var _multisigAccount = auth.multisigAccount; //
	var _hoursDue = auth.hoursDue;  //
	var _amount = auth.amount; // 
	var _fee = auth.fee; //
	var _hexMessage = auth.hexMessage; //
	var _multisigFee = auth.multisigFee; //
	var _encrypt = auth.encrypt; //
	var _timer = auth.timer;
	var _dailyTimer = auth.timer;
	var _maxAmount = auth.maxAmount;
	var _maxDayliAmount = auth.maxDayliAmount;

// include the required class
NEM = require('./NEM.js');

// create an instance using default configuration options
var nem = new NEM();

//Setting pull interval
var the_interval = _timer * 60 * 1000;
console.log("Success...");
console.log("\n");
console.log("Starting first check in", _timer, "minutes");

//starting with 0
var dayliAmount = 0;
var time = 0;

setInterval(function() {

			//We want to check for funds
			var fundsCheck = {
			account: _multisigAccount
			};
		
			var fundsBalance;

		//output a pretty formated JSON text
		var toPrettyJson2 = function(fundsCheck) {
		var h = JSON.stringify(fundsCheck,null,4);
		//console.log(h);

		//parsing Json
		obj2 = JSON.parse(h);

		//Get multisig account balance
		fundsBalance = obj2.balance;
		};	

		//request multisig account balance
			nem.nccPost('/account/find',fundsCheck
			,function(err) {
			console.log(err);
			}
			,toPrettyJson2
			);	

	//If 24h => reset dailyAmount
	if (time > _dailyTimer * 60 * 1000)
	{
	dailyAmount = 0;
	}
	
	//DB connection
	var mysql      = require('mysql');
	var pool = mysql.createPool({
	  host     : _DBhost,
	  user     : _DBuser,
	  password : _DBpassword,
	  database : _database
	});

	pool.getConnection(function(err,connection){
        if (err) {
          connection.release();
          console.log('Error connecting database...');	
          return;
        } 

	console.log('connected as id ' + connection.threadId);
	
	//Select addresses with balance == _amount (/1000000 because the _amount value is in the smallest possible NEM fraction, that means that 1000000 means 1.000000 NEM.)
	connection.query('SELECT * from yourTable WHERE columnBalance=? LIMIT 10', [_amount/1000000], function(err, rows, fields) {
	//connection.release();
	if (rows.length == 0)
	{
	     console.log('No transaction to initiate, waiting...');	
		 console.log("\n");
		time += _timer * 60 * 1000; 
	} else{	
		var i;
		for(i=0; i < rows.length; i++) //Batch Tx
		{
			//Cleaning "-" from addresses if any
			var cleanAddress = [];
			cleanAddress[i] = rows[i].XEMaddress.replace(/[^a-z\d\s]+/gi, "");
			
			//address from DB
			var address = [];
			address[i] = rows[i].XEMaddress;
			
			//address balance from DB
			var balance = [];
			balance[i] = rows[i].balance;
		
  console.log('Transaction to: ', cleanAddress[i]);

		// TransfertSendRequest (contain your decrypted informations and transaction parameters)
		var transac = [];
		transac[i] = {
		wallet: _wallet,
		type: _type,
		multisigAccount: _multisigAccount,
		account: _account,
		recipient: cleanAddress[i],
		amount:  _amount,
		hexMessage: _hexMessage,
		encrypt: _encrypt,
		hoursDue: _hoursDue,
		password: _password,
		fee: _fee,
		multisigFee: _multisigFee
		};

		//output a pretty formated JSON text
		var toPrettyJson = function(transac) {
		var e = JSON.stringify(transac,null,4);
		//console.log(e);
		};

		
		//Maximal Amount is _maxAmount XEM per tx
		if (rows[i].balance > _maxAmount)
		{
		console.log("There is a problem maximum amount per transaction exceeded");
		console.log("Following Transaction cause problems:");
		console.log(rows[i].id);
		throw new Error('Something goes wrong !');
		}
		//Maximum dayliAmount is _maxDayliAmount XEM
		else if (dayliAmount < _maxDayliAmount)
		{

		if (fundsBalance < rows.length*(_amount+_fee+_multisigFee))
		{
			console.log("\n");
			console.log("INSUFFICIENT FUNDS");
			console.log("Funds balance:");
			console.log(fundsBalance);
			time += _timer * 60 * 1000;
		}else{

		
		//Initiate signature request
		nem.nccPost('/wallet/account/transaction/send',transac[i]
		,function(err) {
		console.log(err);
		}
		,toPrettyJson
		);
		dayliAmount += balance[i];
		time += _timer * 60 * 1000;
		//We reset addresses balance
		connection.query('UPDATE yourTable SET columBalance=0 WHERE columnAddress=?', [address[i]], function (err, result) {
		    if (err) throw err;
		  });
			}//endelse check funds
		}//endif dayli amount
		else{
		console.log("MAXIMAL AMOUNT REACHED !");
		console.log("Waiting...");
		time += _timer * 60 * 1000;
		}
		}//endfor

		//Batch report
		console.log("\n");
		console.log("Total transactions: ");
		console.log(rows.length);
		console.log("Total amount: ");
		console.log(dayliAmount);
		console.log("Done, waiting...");
		console.log("\n");
		connection.release();

}
});

connection.on('error', function(err) {      
              console.log('Error connecting database...');
              return;    
        });
  });

}, the_interval);
});
}
