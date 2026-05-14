const API = "http://localhost:5000";
const intrusionSound = new Audio("./audioDBMS.mp3");

/* =========================================
   LOGIN
========================================= */

async function login(){

    const username =
        document.getElementById("username").value;

    const password =
        document.getElementById("password").value;

    try{

        const res = await fetch(

            `${API}/login`,

            {

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({

                    username,
                    password

                })

            }

        );

        const data = await res.json();

        if(data.success){

            localStorage.setItem(
                "username",
                username
            );

            localStorage.setItem(
                "role",
                data.role
            );

            window.location.href =
                "dashboard.html";

        }

        else{

            document.getElementById("msg")
            .innerHTML =

            "❌ Invalid Credentials";

        }

    }

    catch(err){

        console.log(err);

    }

}

/* =========================================
   LOGOUT
========================================= */

function logout(){

    localStorage.clear();

    window.location.href =
        "index.html";
}

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

async function addEvidence(){

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

    if(

        caseId === "" ||

        evidence === "" ||

        description === "" ||

        warrant === ""

    ){

        alert("❌ Please fill all fields");

        return;
    }

    const hash = generateHash(

        evidence + description

    );

    try{

        const res = await fetch(

            `${API}/addEvidence`,

            {

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({

                    caseId,
                    evidence,
                    description,
                    officer,
                    warrant,
                    hash

                })

            }

        );

        const data = await res.json();

        console.log(data);

        if(data.success){

            alert(
                "✅ Evidence Added Successfully"
            );

            document.getElementById(
                "caseId"
            ).value = "";

            document.getElementById(
                "evidenceData"
            ).value = "";

            document.getElementById(
                "description"
            ).value = "";

            document.getElementById(
                "warrantId"
            ).value = "";

            loadStats();

            loadEvidence();

        }

        else{

            alert(
                "❌ Failed To Add Evidence"
            );

        }

    }

    catch(err){

        console.log(err);

        alert(
            "❌ Server Error"
        );

    }

}

/* =========================================
   LOAD DASHBOARD STATS
========================================= */

async function loadStats(){

    try{

        const res = await fetch(

            `${API}/stats`

        );

        const data = await res.json();

        if(document.getElementById("totalCases")){

            document.getElementById(
                "totalCases"
            ).innerHTML =

            data.totalCases;
        }

        if(document.getElementById("totalEvidence")){

            document.getElementById(
                "totalEvidence"
            ).innerHTML =

            data.totalEvidence;
        }

        if(document.getElementById("intrusionCount")){

            document.getElementById(
                "intrusionCount"
            ).innerHTML =

            data.totalIntrusions;
        }

    }

    catch(err){

        console.log(err);

    }

}

/* =========================================
   LOAD EVIDENCE LOGS
========================================= */

async function loadEvidence(){

    const logsTable =
    document.getElementById("logsTable");

    if(!logsTable){

        console.log("logsTable NOT FOUND");

        return;

    }

    try{

        const username =
        localStorage.getItem("username");

        console.log(
            "USERNAME:",
            username
        );

        const response = await fetch(

            `${API}/evidence/${username}`

        );

        const data =
        await response.json();

        console.log(
            "EVIDENCE RECEIVED:",
            data
        );

        logsTable.innerHTML = "";

        data.forEach((item)=>{

            const row =

            `

            <tr>

                <td>${item.case_id}</td>

                <td>${item.data}</td>

                <td>

                    Verified

                </td>

                <td>

                    ${(item.hash_value || "NO_HASH")
                    .substring(0,12)}...

                </td>

            </tr>

            `;

            logsTable.innerHTML += row;

        });

    }

    catch(err){

        console.log(
            "LOAD ERROR:",
            err
        );

    }

}

/* =========================================
   VERIFY WARRANT ACCESS
========================================= */

async function verifyAccess(){

    const caseId =
        document.getElementById("verifyCase").value;

    const warrantId =
        document.getElementById("verifyWarrant").value;

    try{

        const res = await fetch(

            `${API}/verify`,

            {

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

               body:JSON.stringify({

    caseId,
    warrantId,

    username:
    localStorage.getItem("username")

})

            }

        );

        const data = await res.json();

        if(data.success){
            console.log(
                "VERIFIED EVIDENCE:",
                data.evidence
            );

            localStorage.setItem(

                "authorizedEvidence",

                JSON.stringify(data.evidence)

            );
          alert("Access Granted");

            window.location.href =
                "evidence.html";

        }

        else{
            intrusionSound.currentTime = 0;
            intrusionSound.play();

    document.getElementById(
        "verifyMessage"
    ).innerHTML =

    "🚨 Intrusion Detected";
       
    /* REFRESH DASHBOARD */

    loadStats();

}

    }

    catch(err){

        console.log(err);

    }

}

/* =========================================
   LOAD EVIDENCE PAGE
========================================= */

function loadAuthorizedEvidence(){

    const container =

    document.getElementById(

        "evidenceContainer"

    );

    if(!container) return;

    const evidence = JSON.parse(

        localStorage.getItem(

            "authorizedEvidence"

        )

    ) || [];

    console.log(
        "LOADED EVIDENCE:",
        evidence
    );

    container.innerHTML = "";

    evidence.forEach((item)=>{

        container.innerHTML +=

        `

        <div class="evidence-card">

            <h3>Case ID: ${item.case_id}</h3>

            <p>

                <b>Officer:</b>

                ${item.officer_name}

            </p>

            <p>

                <b>Evidence:</b>

                ${item.data}

            </p>

            <p>

                <b>Hash:</b>

                ${item.hash_value}

            </p>

        </div>

        `;

    });

}




/* =========================================
   AUTO LOAD
========================================= */

window.onload = function(){

    if(document.getElementById("officerName")){

        document.getElementById(
            "officerName"
        ).value =

        localStorage.getItem(
            "username"
        );
    }

    loadStats();

    loadEvidence();

    loadAuthorizedEvidence();

};