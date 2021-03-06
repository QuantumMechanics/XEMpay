# XEMpay
Automated multisignature initiator for XEM Cryptocurrency

# Features
- Password encrypted configuration (aes-128-ecb)
- Batch transactions with limiter
- Multisig account balance watcher
- Timer
- Max amount per tx, program stops if amount exceeded (meaning something goes wrong)
- Max dayli amount
- Transaction details
- MySQL support

# How to

You must have a local NCC running connected to a local or remote NIS.<br>
If you want it to be as light as possible, you can use a local NCC to sign the multisig transactions and a remote NIS to propagate them. The cosignatory account needs to be in a wallet that belongs to your local NCC.<br><br>
To connect your NCC to a remote NIS:<br>
-Run the NCC only<br>
-In settings choose Remote Server and enter the Host (you can choose an host <a href="http://www.nodeexplorer.com/" target="_blank">here</a>)<br>
-Save. Now you can close your browser and let the NCC run in background.

You need NodeJs.<br>
Be sure you have NEM.js from <a href="https://github.com/NewEconomyMovement/nodejs2nem" target="_blank">nodejs2nem</a> inside your folder.

XEMpay is the transaction initiator. It's the first cosignatory who ask for <a href="https://github.com/QuantumMechanics/XEMsign" target="_blank"><b>XEMsign</b></a> signatures. XEMpay pull addresses meeting requirements from MySQL database and initiate batch signatures requests.

You need to insert correct informations inside SENDaccess.json:<br>
All addresses must be in the "NAMOAVHFVPJ6FP32YP2GCM64WSRMKXA5KKYWWHPY" format. NO "-".
- <b>Database connection parameters</b>
- <b>Wallet & transaction parameters</b> (Warning, for "amount", "fee" and "multisigFee" only, values are in the smallest possible NEM fraction, that means that 1000000 means 1.000000 NEM).
- <b>timer</b>: Number of minutes between each pull, set by default to 5.
- <b>dayliTimer</b>: Timer before dayliAmount reset to 0 in minutes<br>
- <b>maxAmount</b>: Maximal XEM amount per tx, in case of a bigger transaction, the program stop.<br>
- <b>maxDayliAmount</b>: Maximal amount per days.<br>

Inside XEMpay.js, on line 142 & 223, you need to set db query accordignly to your table name and column name.<br>
Query on line 142 select all balances with the amount set in SENDaccess.<br>
Query on line 223 update all balances & reset them to 0 after transaction process.

Next, Run XEMpay.js using:

nodejs pathTo/XEMpay.js

Then follow instructions.

# Not working ?

Normally it should work out of the box. If not, you need to check:
- If NEM.js is present in your folder
- If you have deleted SENDaccess.json after encryption.

If still not working, you need to install Express, Secure-conf and MySQL:

- Express: npm install express
- Secure-conf: npm install secure-conf
- Mysql: npm install mysql

# Warning 

<b>As the wallet is exposed you shouldn't store any funds on it !</b>

# Work in progress
- Fill SENDaccess.json with random datas and auto delete.
- Remove useless code.
- Add some hard coded rules in SENDaccess.json

<b>BTC</b>: 1BRuxYZ3ohDJkfEWKVMWAiYrAYjwNSaPJs<br>
<b>XEM</b>: NAMOAV-HFVPJ6-FP32YP-2GCM64-WSRMKX-A5KKYW-WHPY
