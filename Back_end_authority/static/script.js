async function testDB() {
    const res = await fetch("/test-user", {
        headers: { "x-api-token": "7jGSJBKvTAe_apDcHXUeFkgV2Iyy0lEmlAeE_9gIiTU" }
    });
    const data = await res.json();
    document.getElementById("output").innerText = JSON.stringify(data, null, 2);
}

async function createSession() {
    const res = await fetch("/session/create?user_id=test", {
        method: "POST",
        headers: { "x-api-token": "7jGSJBKvTAe_apDcHXUeFkgV2Iyy0lEmlAeE_9gIiTU" }
    });
    const data = await res.json();
    document.getElementById("output").innerText = JSON.stringify(data, null, 2);
}