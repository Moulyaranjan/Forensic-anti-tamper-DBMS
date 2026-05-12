/* =========================================
   FORENSIC ANTI-TAMPER SYSTEM
   LOCAL STORAGE VERSION
========================================= */

/* LOGIN */

async function login() {

    const username =
        document.getElementById("username").value;

    const password =
        document.getElementById("password").value;

    /* DEMO USERS */

    const users = [

        {
            username:"chief",
            password:"1234",
            role:"admin"
        },

        {
            username:"officer_01",
            password:"1111",
            role:"officer"
        },

        {
            username:"officer_02",
            password:"2222",
            role:"officer"
        }

    ];

    const validUser = users.find(

        user =>

            user.username === username &&

            user.password === password

    );

    if(validUser){

        localStorage.setItem(
            "loggedIn",
            "true"
        );

        localStorage.setItem(
            "username",
            validUser.username
        );

        localStorage.setItem(
            "role",
            validUser.role
        );

        window.location.href =
            "dashboard.html";

    }

    else{

        document.getElementById("msg")
        .innerHTML =
        "❌ Invalid Login Credentials";

    }

}

/* =========================================
   LOGOUT
========================================= */

function logout(){

    localStorage.removeItem("loggedIn");

    localStorage.removeItem("username");

    localStorage.removeItem("role");

    window.location.href =
        "index.html";
}

/* =========================================
   GLOBAL BLOCKCHAIN ARRAY
========================================= */

let blockchain =

    JSON.parse(

        localStorage.getItem("blockchain")

    ) || [];

/* =========================================
   GENERATE HASH
========================================= */

function generateHash(data){

    return btoa(

        data + Date.now()

    ).substring(0,30);

}

/* =========================================
   ADD EVIDENCE
========================================= */

function addEvidence(){

    const caseId =
        document.getElementById("caseId").value;

    const evidence =
        document.getElementById("evidenceData").value;

    const description =
        document.getElementById("description").value;

    const officer =
        document.getElementById("officerName").value;

    const warrant =
        document.getElementById("warrantId").value;

    /* VALIDATION */

    if(

        caseId === "" ||

        evidence === "" ||

        description === "" ||

        warrant === ""

    ){

        alert("❌ Please fill all fields");

        return;
    }

    /* CREATE BLOCK */

    const newBlock = {

        record_id:
            blockchain.length + 1,

        caseId,

        evidence,

        description,

        assignedOfficer: officer,

        warrant,

        previous_hash:

    blockchain.length > 0

    ? blockchain[
        blockchain.length - 1
      ].current_hash || "GENESIS"

    : "GENESIS",

        current_hash:

            generateHash(
                evidence + description
            )

    };

    /* PUSH INTO ARRAY */

    blockchain.push(newBlock);

    /* SAVE */

    localStorage.setItem(

        "blockchain",

        JSON.stringify(blockchain)

    );

    /* SUCCESS */

    alert("✅ Evidence Added Successfully");

    /* CLEAR FIELDS */

    document.getElementById("caseId").value = "";

    document.getElementById("evidenceData").value = "";

    document.getElementById("description").value = "";

    document.getElementById("warrantId").value = "";

    /* UPDATE */

    updateStats();

    loadEvidence();

}

/* =========================================
   VERIFY ACCESS
========================================= */

function verifyAccess(){

    const caseId =
        document.getElementById("verifyCase").value;

    const warrantId =
        document.getElementById("verifyWarrant").value;

    const currentUser =
        localStorage.getItem("username");

    const currentRole =
        localStorage.getItem("role");

    /* FIND MATCHING RECORDS */

    const matchingEvidence = blockchain.filter(

        block =>

            block.caseId === caseId &&

            block.warrant === warrantId

    );

    /* INVALID */

    if(matchingEvidence.length === 0){

        let intrusions =

            parseInt(

                localStorage.getItem("intrusions")

            ) || 0;

        intrusions++;

        localStorage.setItem(

            "intrusions",

            intrusions

        );

        updateStats();

        document.getElementById(
            "verifyMessage"
        ).innerHTML =

        "❌ Invalid Case ID or Warrant ID";

        return;
    }

    /* ADMIN */

    if(currentRole === "admin"){

        localStorage.setItem(

            "authorizedEvidence",

            JSON.stringify(matchingEvidence)

        );

        window.location.href =
            "evidence.html";

        return;
    }

    /* OFFICER-SPECIFIC ACCESS */

    const officerEvidence = matchingEvidence.filter(

        block =>

            block.assignedOfficer === currentUser

    );

    /* UNAUTHORIZED */

    if(officerEvidence.length === 0){

        let intrusions =

            parseInt(

                localStorage.getItem("intrusions")

            ) || 0;

        intrusions++;

        localStorage.setItem(

            "intrusions",

            intrusions

        );

        updateStats();

        document.getElementById(
            "verifyMessage"
        ).innerHTML =

        "⛔ Unauthorized Access Detected";

        return;
    }

    /* ALLOWED */

    localStorage.setItem(

        "authorizedEvidence",

        JSON.stringify(officerEvidence)

    );

    window.location.href =
        "evidence.html";

}

/* =========================================
   UPDATE DASHBOARD
========================================= */

function updateStats(){

    blockchain =

        JSON.parse(

            localStorage.getItem("blockchain")

        ) || [];

    const intrusions =

        parseInt(

            localStorage.getItem("intrusions")

        ) || 0;

    const totalCases =
        blockchain.length;

    const totalEvidence =
        blockchain.length;

    if(document.getElementById("totalCases")){

        document.getElementById(
            "totalCases"
        ).innerHTML = totalCases;
    }

    if(document.getElementById("totalEvidence")){

        document.getElementById(
            "totalEvidence"
        ).innerHTML = totalEvidence;
    }

    if(document.getElementById("intrusionCount")){

        document.getElementById(
            "intrusionCount"
        ).innerHTML = intrusions;
    }

}

/* =========================================
   LOAD RECENT EVIDENCE
========================================= */

function loadEvidence(){

    blockchain =

        JSON.parse(

            localStorage.getItem("blockchain")

        ) || [];

    const logsTable =
        document.getElementById("logsTable");

    if(!logsTable) return;

    logsTable.innerHTML = "";

    blockchain.reverse().forEach(block => {

        logsTable.innerHTML += `

        <tr>

            <td>${block.caseId}</td>

            <td>${block.evidence}</td>

            <td class="success">
                Verified
            </td>

            <td>
                ${block.current_hash.substring(0,12)}...
            </td>

        </tr>

        `;

    });

}

/* =========================================
   LOAD EVIDENCE PAGE
========================================= */

function loadAuthorizedEvidence(){

    const evidenceContainer =
        document.getElementById(
            "evidenceContainer"
        );

    if(!evidenceContainer) return;

    const evidence =

        JSON.parse(

            localStorage.getItem(
                "authorizedEvidence"
            )

        ) || [];

    evidenceContainer.innerHTML = "";

    if(evidence.length === 0){

        evidenceContainer.innerHTML =

        "<h2>No Evidence Found</h2>";

        return;

    }

    evidence.forEach(block => {

        evidenceContainer.innerHTML += `

        <div class="block">

            <h3>
                Case ID:
                ${block.caseId}
            </h3>

            <p>
                <b>Evidence:</b>
                ${block.evidence}
            </p>

            <p>
                <b>Description:</b>
                ${block.description}
            </p>

            <p>
                <b>Officer:</b>
                ${block.assignedOfficer}
            </p>

            <p class="hash">

                <b>Previous Hash:</b>

                ${block.previous_hash}

            </p>

            <p class="hash">

                <b>Current Hash:</b>

                ${block.current_hash}

            </p>

        </div>

        `;

    });

}

/* =========================================
   INITIAL LOAD
========================================= */

window.onload = function(){

    /* AUTO FILL OFFICER */

    if(document.getElementById("officerName")){

        document.getElementById(
            "officerName"
        ).value =

        localStorage.getItem("username");
    }

    updateStats();

    loadEvidence();

    loadAuthorizedEvidence();

};