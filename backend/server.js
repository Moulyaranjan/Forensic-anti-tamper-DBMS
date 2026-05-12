const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const crypto = require("crypto");

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({

    host:"localhost",
    user:"root",
    password:"1234",
    database:"forensic_db"

});

db.connect((err)=>{

    if(err){
        console.log(err);
    }

    else{
        console.log("MySQL Connected");
    }

});

/* LOGIN */

app.post("/login",(req,res)=>{

    const {username,password} = req.body;

    const sql = `

    SELECT * FROM users

    WHERE username=? AND password=?

    `;

    db.query(

        sql,

        [username,password],

        (err,result)=>{

            if(err){
                return res.status(500).json(err);
            }

            if(result.length > 0){

                res.json({

                    success:true,
                    role:result[0].role,
                    username:result[0].username

                });
            }

            else{

                res.json({
                    success:false
                });
            }

        }

    );

});

/* ADD EVIDENCE */

app.post("/addEvidence", (req, res) => {

    const {

        case_id,
        data,
        warrant_id

    } = req.body;

    const crypto = require("crypto");

    const hash = crypto

    .createHash("sha256")

    .update(data + Date.now())

    .digest("hex");

    /* STEP 1 : CREATE CASE */

    const insertCase =

    `

    INSERT IGNORE INTO cases

    (case_id, case_name)

    VALUES (?, ?)

    `;

    db.query(

        insertCase,

        [

            case_id,

            "Auto Generated Case"

        ],

        (err) => {

            if(err){

                console.log(err);

                return res.status(500).json(err);

            }

            /* STEP 2 : CREATE WARRANT */

            const insertWarrant =

            `

            INSERT IGNORE INTO warrants

            (

                warrant_id,
                case_id,
                issued_to,
                status

            )

            VALUES (?, ?, ?, ?)

            `;

            db.query(

                insertWarrant,

                [

                    warrant_id,
                    case_id,
                    "officer_01",
                    "VALID"

                ],

                (err) => {

                    if(err){

                        console.log(err);

                        return res.status(500).json(err);

                    }

                    /* STEP 3 : INSERT EVIDENCE */

                    const insertEvidence =

                    `

                    INSERT INTO evidence_chain

                    (

                        case_id,
                        officer_name,
                        data,
                        hash_value,
                        warrant_id

                    )

                    VALUES (?, ?, ?, ?, ?)

                    `;

                    db.query(

                        insertEvidence,

                        [

                            case_id,
                            "officer_01",
                            data,
                            hash,
                            warrant_id

                        ],

                        (err, result) => {

                            if(err){

                                console.log(err);

                                return res.status(500)
                                .json(err);

                            }

                            res.json({

                                success:true,

                                message:
                                "Evidence Added"

                            });

                        }

                    );

                }

            );

        }

    );

});

app.get("/evidence",(req,res)=>{

    const sql = `

    SELECT * FROM evidence_chain

    ORDER BY timestamp DESC

    `;

    db.query(sql,(err,result)=>{

        if(err){

            return res.status(500)
            .json(err);
        }

        res.json(result);

    });

});

app.get("/stats",(req,res)=>{

    const stats = {};

    db.query(

    "SELECT COUNT(*) AS totalCases FROM cases",

    (err,result1)=>{

        stats.totalCases =
            result1[0].totalCases;

        db.query(

        "SELECT COUNT(*) AS totalEvidence FROM evidence_chain",

        (err,result2)=>{

            stats.totalEvidence =
                result2[0].totalEvidence;

            db.query(

            "SELECT COUNT(*) AS intrusions FROM intrusion_logs",

            (err,result3)=>{

                stats.intrusions =
                    result3[0].intrusions;

                res.json(stats);

            });

        });

    });

});

app.listen(5000,()=>{

    console.log("Server Running On Port 5000");

});
