const express = require("express");

const mysql = require("mysql2");

const cors = require("cors");

const app = express();
process.on("uncaughtException",(err)=>{

    console.log(
        "UNCAUGHT ERROR:",
        err
    );

});

/* MIDDLEWARE */

app.use(cors());

app.use(express.json());

/* MYSQL CONNECTION */

const db = mysql.createConnection({

    host:"localhost",

    user:"root",

    password:"1234",

    database:"forensic_db"

});

/* CONNECT */

db.connect((err)=>{

    if(err){

        console.log("MYSQL ERROR:",err);

    }

    else{

        console.log("✅ MySQL Connected");

    }

});

/* =========================================
   LOGIN API
========================================= */

app.post("/login",(req,res)=>{
console.log("LOGIN API HIT");

console.log(req.body);
    const{

        username,
        password

    } = req.body;

    const sql =

    `

    SELECT * FROM users

    WHERE username=? AND password=?

    `;

    db.query(

        sql,

        [

            username,
            password

        ],

        (err,result)=>{

            if(err){

                console.log(err);

                return res.json({

                    success:false

                });

            }

            if(result.length > 0){

                res.json({

                    success:true,

                    role:result[0].role

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

/* =========================================
   ADD EVIDENCE API
========================================= */

app.post("/addEvidence",(req,res)=>{

    console.log("API HIT");

    console.log(req.body);

    const{

        caseId,
        evidence,
        description,
        officer,
        warrant,
        hash

    } = req.body;

    /* INSERT CASE */

    const insertCase =

    `

    INSERT IGNORE INTO cases

    (case_id,case_name)

    VALUES (?,?)

    `;

    db.query(

        insertCase,

        [

            caseId,

            "Auto Generated Case"

        ],

        (err)=>{

            if(err){

                console.log(err);

                return res.json({

                    success:false,

                    message:"Case Insert Failed"

                });

            }

            /* INSERT WARRANT */

            const insertWarrant =

            `

            INSERT IGNORE INTO warrants

            (

                warrant_id,
                case_id,
                issued_to,
                status

            )

            VALUES (?,?,?,?)

            `;

            db.query(

                insertWarrant,

                [

                    warrant,
                    caseId,
                    officer,
                    "VALID"

                ],

                (err)=>{

                    if(err){

                        console.log(err);

                        return res.json({

                            success:false,

                            message:"Warrant Insert Failed"

                        });

                    }

                    /* INSERT EVIDENCE */

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

                    VALUES (?,?,?,?,?)

                    `;

                    db.query(

                        insertEvidence,

                        [

                            caseId,

                            officer,

                            evidence +
                            " - " +
                            description,

                            hash,

                            warrant

                        ],

                        (err,result)=>{

                            if(err){

                                console.log(err);

                                return res.json({

                                    success:false,

                                    message:
                                    "Evidence Insert Failed"

                                });

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

/* =========================================
   GET ALL EVIDENCE
========================================= */

app.get("/evidence",(req,res)=>{

    const sql =

    `

    SELECT * FROM evidence_chain

    ORDER BY evidence_id DESC

    `;

    db.query(

        sql,

        (err,result)=>{

            if(err){

                console.log(err);

                return res.json([]);

            }

            res.json(result);

        }

    );

});

/* =========================================
   DASHBOARD STATS
========================================= */

app.get("/stats",(req,res)=>{

    const stats = {};

    db.query(

        "SELECT COUNT(*) AS totalCases FROM cases",

        (err,result)=>{

            stats.totalCases =
            result[0].totalCases;

            db.query(

                `

                SELECT COUNT(*) AS totalEvidence

                FROM evidence_chain

                `,

                (err,result)=>{

                    stats.totalEvidence =
                    result[0].totalEvidence;

                    db.query(

                        `

                        SELECT COUNT(*) AS totalIntrusions

                        FROM intrusion_logs

                        `,

                        (err,result)=>{

                            stats.totalIntrusions =
                            result[0].totalIntrusions;

                            res.json(stats);

                        }

                    );

                }

            );

        }

    );

});

/* =========================================
   VERIFY WARRANT ACCESS
========================================= */
app.post("/verify",(req,res)=>{

    const{

        caseId,
        warrantId

    } = req.body;

    const sql =

    `

    SELECT * FROM evidence_chain

WHERE case_id=?
AND warrant_id=?
AND officer_name=?

    `;

    db.query(

        sql,

        [

           [
    caseId,
    warrantId,
    req.body.username
]

        ],

        (err,result)=>{

            if(err){

                console.log(err);

                return res.json({

                    success:false

                });

            }

            /* VALID ACCESS */

            if(result.length > 0){

                return res.json({

                    success:true,

                    evidence:result

                });

            }

            /* INVALID ACCESS */

            const intrusionSql =

            `

            INSERT INTO intrusion_logs

            (attempt,severity)

            VALUES (?,?)

            `;

            db.query(

                intrusionSql,

                [

                    `Unauthorized access for Case ID ${caseId}`,

                    "HIGH"

                ],

                (err,intrusionResult)=>{

                    if(err){

                        console.log(
                            "INTRUSION ERROR:",
                            err
                        );

                        return res.json({

                            success:false,

                            message:
                            "Intrusion Logging Failed"

                        });

                    }

                    console.log(
                        "🚨 Intrusion Logged"
                    );

                    return res.json({

                        success:false,

                        message:
                        "Intrusion Detected"

                    });

                }

            );

        }

    );

});

/* =========================================
   SERVER
========================================= */

app.listen(5000,()=>{

    console.log(
        "🚀 Server Running On Port 5000"
    );

});
