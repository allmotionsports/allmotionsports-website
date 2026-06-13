(function () {
  "use strict";

  var POLL_MS = 20000;
  var currency = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  var raisedEl = document.getElementById("donation-raised");
  if (!raisedEl) return;

  var goalEl = document.getElementById("donation-goal");
  var percentEl = document.getElementById("donation-percent");
  var donorsEl = document.getElementById("donation-donors");
  var fillEl = document.getElementById("donation-progress-fill");
  var barEl = document.getElementById("donation-progressbar");
  var markersEl = document.getElementById("donation-milestone-markers");
  var milestonesListEl = document.getElementById("donation-milestones-list");
  var transparencyCommunity = document.getElementById("transparency-community");
  var transparencyAthletes = document.getElementById("transparency-athletes");
  var transparencyScholarships = document.getElementById("transparency-scholarships");

  function formatMoney(amount) {
    return currency.format(Number(amount) || 0);
  }

  function renderMilestones(milestones, goal) {
    if (!milestonesListEl || !Array.isArray(milestones)) return;

    milestonesListEl.innerHTML = "";
    milestones.forEach(function (m) {
      var li = document.createElement("li");
      li.textContent = "\uD83C\uDFAF " + formatMoney(m.amount) + " — " + m.label;
      milestonesListEl.appendChild(li);
    });

    if (markersEl && goal > 0) {
      markersEl.innerHTML = "";
      milestones.forEach(function (m) {
        var pct = Math.min(100, (m.amount / goal) * 100);
        var mark = document.createElement("span");
        mark.className = "donate-milestone-marker";
        mark.style.left = pct + "%";
        mark.title = formatMoney(m.amount);
        markersEl.appendChild(mark);
      });
    }
  }

  function applyStats(data) {
    if (!data) return;

    raisedEl.textContent = formatMoney(data.totalRaised);
    goalEl.textContent = formatMoney(data.goal);
    percentEl.textContent = (data.percentageFunded || 0) + "% Funded";
    donorsEl.textContent = String(data.donorCount || 0);

    var pct = Math.min(100, data.percentageFunded || 0);
    fillEl.style.width = pct + "%";
    barEl.setAttribute("aria-valuenow", String(Math.round(pct)));

    renderMilestones(data.milestones, data.goal);

    if (data.transparency) {
      transparencyCommunity.textContent = formatMoney(data.transparency.communityDonations);
      transparencyAthletes.textContent = String(data.transparency.athletesSupported || 0);
      transparencyScholarships.textContent = String(data.transparency.scholarshipsAwarded || 0);
    }
  }

  function fetchStats() {
    return fetch("/api/donations/stats", { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("Stats unavailable");
        return res.json();
      })
      .then(applyStats)
      .catch(function () {
        /* Keep last values on screen; API runs on Vercel after deploy. */
      });
  }

  fetchStats();
  setInterval(fetchStats, POLL_MS);
})();
