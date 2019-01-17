status_ind = 0; // global indicador estado
max_status = 50; // estado con el numero mas alto
var infoCalendario;

function initStorage() {
    if (!localStorage.getItem('dayStatus')) {
        //            infoCalendario = [{
        //                "mes": dateToYYYYMM(new Date()),
        //                "dayStatus": (new Array(32)).fill(0)
        //            }];

        infoCalendario = new Array();
        /*
        
    var i;
    for (i = 0; i < 12; i++) {
        console.log(i);
        infoCalendario[i] = {
            "mes": 201901 + i,
            "dayStatus": (new Array(32)).fill(0)
        };
    }

        // setMonths();

    saveStorage();*/
        setMonths();

    } else {
        loadStorage();
    }
}

function saveStorage(newInfo = infoCalendario) {
    localStorage.setItem("dayStatus", JSON.stringify(newInfo));
    reloadStorageTA();
}

function loadStorage() {
    infoCalendario = JSON.parse(localStorage.getItem("dayStatus"));
}

function cleanInfo() {
    loadStorage();

    today = new Date();

    for (i in infoCalendario) {
        var diff = parseYYYYMM(infoCalendario[i]["mes"]) - today;
        if (diff < -31 * 24 * 3600 * 1000) {
            infoCalendario.splice(0, 1);
        }
    }

    saveStorage();

}

function reloadStorageTA() {
    var storageTA = document.getElementById("storage_content");

    storageTA.value = localStorage.getItem("dayStatus");
}

function copyStorageTA() {
    var storageTA = document.getElementById("storage_content");
    storageTA.select();
    document.execCommand('copy');
}

function importTAtoStorage() {
    var storageTA = document.getElementById("storage_content");
    // console.log(storageTA);
    try {
        var content = JSON.parse(storageTA.value);
    } catch (error) {
        highlightBg(document.getElementById("storage_content"), '#fcc');
        console.error("Se ha producido el siguiente error durante la importacion:\n" + error);

        return false;
    }
    infoCalendario = content;
    // console.log(content);
    saveStorage();
    highlightBg(document.getElementById("storage_content"), '#cfc');
    // location.reload();
    reloadCalendar();
}

function validStatus(status) {

    if (status >= -1 && status <= max_status) {
        return status;
    } else {
        console.error("Tried to assign non-valid status " + status + " to DayCell object.");
        return 0;
    }

}

function dayToCol(diaSemana) {
    if (diaSemana > 6) {
        console.log("diaSemana mal!");
    }
    switch (diaSemana) {
        case 0:
            return 6;
        default:
            return (diaSemana - 1);
    }
}

function nextMonth(yyyymm) {

    year = parseInt(yyyymm.toString().substr(0, 4));
    month = parseInt(yyyymm.toString().substr(4, 2));
    // console.log("month is "+month+" year is "+year);

    if (month == 12) {
        return ((year + 1) * 100 + 1);
    } else {
        return yyyymm + 1;
    }

}

function setMonths() {

    input_desde = document.getElementById("input_desde");
    input_hasta = document.getElementById("input_hasta");

    desde = parseInt(input_desde.value);
    hasta = parseInt(input_hasta.value);

    // console.log( typeof(desde) );
    console.log(desde + " -> " + hasta);

    if (desde > hasta) {
        console.error('Error: el mes del campo "desde" es posterior al de "hasta"');
        return;
    }

    var new_infoCalendario = new Array();
    var actual = desde;
    var idx = 0;
    // for (i = 0; i <  hasta-desde+1 ; i++) {
    while (actual < nextMonth(hasta)) {

        idx = new_infoCalendario.push({
            "mes": actual
        }) - 1;
        // nextMonth(desde+i);
        // console.log(new_infoCalendario[i]);

        // new_infoCalendario[idx]["mes"] = desde+i;
        for (j = 0; j < infoCalendario.length; j++) {
            if (infoCalendario[j]["mes"] == new_infoCalendario[idx]["mes"]) {
                new_infoCalendario[idx]["dayStatus"] = infoCalendario[j]["dayStatus"];
                break;
            }
        }
        // console.log("dayStatus" in new_infoCalendario[i]);

        if (!("dayStatus" in new_infoCalendario[idx])) {
            new_infoCalendario[idx]["dayStatus"] = (new Array(32)).fill(0);
        }

        // new_infoCalendario[i]["dayStatus"] = (new Array(32)).fill(0);



        actual = nextMonth(actual);
    }

    infoCalendario = new_infoCalendario;
    saveStorage();
    highlightBg(document.getElementById("storage_content"), '#cfc');
    // location.reload();
    reloadCalendar();

}

Number.prototype.colIncrease = function () {
    switch (this.valueOf()) {
        case 6:
            return 0;

        default:
            return (this.valueOf() + 1);
    }
}

function daysInMonth(iMonth, iYear) { // mes de 0 a 11
    return 32 - new Date(iYear, iMonth, 32).getDate();
}

function queueUpload(aMes) {

    saveStorage();

    /*
    upRequest = new Request('http://localhost/send', {
        method: 'POST',
        body: JSON.stringify(infoCalendario),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    fetch(upRequest)
        .then(response => {
            if (response.status === 200) {
//                        console.log(response);
//                        rp = response.json();
                return response.json();
            } else {
                throw new Error('Something went wrong on api server!');
            }
        })
        .then(response => {
            console.log(response);
            // ...
        }).catch(error => {
            console.error(error);
        });*/

}

var DayCell = function (diames, td = null, text = null, status = 0) {
    var self = this;
    this.dia = diames;
    this.td = td;
    this.text = text;
    this.status = validStatus(status);
    //            window.addEventListener("click", function(e) {
    //                console.log(e);
    //                setStatus(e)
    //            });

}

function setStatus(event /*td, aMes, dia*/ ) {

    // console.log(event);

    // var td = event.target;
    var td = this;

    if (td.tagName == "TD") {

        var status = validStatus(status_ind);

        if (event.type == "click") {
            event.preventDefault();
        }

        if (event.type == "dragstart") {

            event.dataTransfer.dropEffect = "copy";
            var colorbox = document.createElement("div");
            colorbox.id = "drag-colorbox";

            colorbox.classList.add("status" + status);

            document.body.appendChild(colorbox);
            event.dataTransfer.setData("text/plain", "");
            event.dataTransfer.setDragImage(colorbox, 20, 20);
        }

        if (event.type == "drop" || event.type == "dragenter") {
            // event.preventDefault();
        }

        if (event.type == "drop") {
            document.getElementById("drag-colorbox").remove();
            event.preventDefault();
            // console.log("removed");
        }

        var aMes = td.getAttribute("data-mes");
        var dia = td.getAttribute("data-dia");

        //            console.log(td);
        var i;
        for (i = 0; i <= max_status; i++) {
            td.classList.remove("status" + i);
        }
        td.classList.add("status" + status);

        td.childNodes[1].innerText = textList[status];

        // console.log(typeof (dia));

        for (m in infoCalendario) {
            // console.log(infoCalendario[m]["mes"] == aMes);
            if (infoCalendario[m]["mes"] == aMes) {
                infoCalendario[m]["dayStatus"][dia] = Number(status);
                queueUpload(aMes);
                break;
            }
        }
    }

}

function dayToggle(ele) {
    console.log(ele);
    ele.style.background = "green";
}

function padded2(number) {
    if (number <= 99) {
        number = ("000" + number).slice(-2);
    }
    return number;
}

function dateToYYYYMM(fecha) {
    mes = (fecha.getMonth() + 1) + fecha.getFullYear() * 100;
    return mes;
}

function parseYYYYMM(intDate) {
    var date = new Date();
    var year = Math.floor(intDate / 100);
    var month = intDate - year * 100;
    date.setMonth(month - 1);
    date.setFullYear(year);
    date.setDate(1);

    //            console.log(date);

    return date;
}

function calBuilder() {

    for (i_c in infoCalendario) {
        var info = infoCalendario[i_c];
        var fechaMes = parseYYYYMM(info["mes"]);
        //            var fechaMes = info["mes"];
        var fechaShort = dateToYYYYMM(fechaMes);
        var dayStatus = info["dayStatus"];

        // NUEVO TIPO
        textList = new Array();
        textList[0] = "";
        textList[1] = "Despliegue TEST (12:00)";
        textList[2] = "IOP de VDC + CCF + BPI (18:00)";
        textList[21] = "IOP de BPI (18:00)";
        textList[22] = "IOP de VDC + CCF (18:00)";
        textList[3] = "Festivo";
        textList[4] = "Periodo crítico";


        var cellArray = new Array();

        fechaMes.setDate(1);
        var caldiv = document.getElementById("caldiv");

        var nombreMes = fechaMes.toLocaleDateString('es-ES', options = {
            month: 'long'
        });

        var anyo = fechaMes.getFullYear();

        // var htmlAdd = '<table id="' + nombreMes + '" class="calendar">';
        var ele_table = document.createElement("table");
        ele_table.id = anyo + nombreMes.substr(0, 3);
        ele_table.classList.add("calendar");

        // htmlAdd += '<tr><th class="nmes" colspan=7 >' + nombreMes + '</th></tr>';
        var itr = document.createElement("tr");
        var ith = document.createElement("th");
        ith.classList.add("nmes");
        ith.setAttribute("colspan", 7);
        ith.innerText = nombreMes + ' ~ ' + anyo;
        itr.appendChild(ith);


        ele_table.appendChild(itr)

        // htmlAdd += '<tr><th>L</th><th>M</th><th>X</th><th>J</th><th>V</th><th>S</th><th>D</th></tr>';
        itr = document.createElement("tr");
        itr.innerHTML = "<th>L</th><th>M</th><th>X</th><th>J</th><th>V</th><th>S</th><th>D</th>";
        ele_table.appendChild(itr);

        var diasMes = daysInMonth(fechaMes.getMonth(), fechaMes.getFullYear());
        var diaSemana = fechaMes.getDay();
        var diaCol = dayToCol(diaSemana);
        var iCol = 0;
        var i;
        var ip;

        for (i = 1 - diaCol; i <= diasMes; i++) { // 1 o 2??
            if (iCol.colIncrease() == 1) {
                // htmlAdd += '<tr>';
                itr = document.createElement("tr");
                ele_table.appendChild(itr);
            }
            // console.log(iCol);
            itd = document.createElement("td");
            itr.appendChild(itd);
            if (i > 0) {
                if (iCol > 4) { // sabados y domingos
                    // htmlAdd += '<td class="finde"><p class="ndia">' + i + '</p></td>';

                    itd.classList.add("finde");
                    itd.innerHTML = '<p class="ndia">' + i + '</p>';


                } else { // el resto
                    // htmlAdd += '<td id="dia'+i+'" onClick="dayToggle(this);"><p class="ndia">' + i + '</p><p class="texto">' + textoPro + '</p></td>';
                    itd.classList.add("status" + dayStatus[i]);
                    itd.innerHTML = '<p class="ndia">' + i + '</p>';

                    itd.setAttribute("data-mes", info["mes"]);
                    itd.setAttribute("data-dia", i);
                    itd.setAttribute("draggable", true);

                    itd.addEventListener("click", setStatus, false);
                    itd.addEventListener("dragstart", setStatus, false);
                    itd.addEventListener("dragenter", setStatus, false);
                    itd.addEventListener("drop", setStatus, false);
                    itd.addEventListener("dragover", function (e) {
                        e.preventDefault()
                    }, false);

                    // itd.setAttribute("onclick", "setStatus(this, " + info["mes"] + "," + i + ");");

                    // soporte de arrastrar?
                    // itd.setAttribute("ondragover", "setStatus(this, " + info["mes"] + "," + i + ");");

                    ip = document.createElement("p");
                    ip.classList.add("texto");
                    ip.innerText = textList[dayStatus[i]];
                    itd.appendChild(ip);
                    cellArray[i] = new DayCell(i, itd, dayStatus[i]);

                }

            } else {
                // htmlAdd += '<td class="empty"></td>'
                itd.classList.add("empty");
            }



            if (iCol == 6) {
                // htmlAdd += '</tr>';
            }
            iCol = iCol.colIncrease();
        }


        // htmlAdd += "</table>";

        // caldiv.insertAdjacentHTML('beforeend', htmlAdd);
        caldiv.appendChild(ele_table);


    }

    // return cellArray;
}

function reloadCalendar() {

    var caldiv = document.getElementById("caldiv");
    while (caldiv.hasChildNodes()) {
        // console.log(caldiv.firstChild);
        caldiv.removeChild(caldiv.firstChild);
    }

    calBuilder();

    input_desde = document.getElementById("input_desde");
    input_hasta = document.getElementById("input_hasta");

    input_desde.value = infoCalendario[0]["mes"];
    input_hasta.value = infoCalendario[infoCalendario.length - 1]["mes"];

    // for (i in infoCalendario) {
    //         calBuilder(infoCalendario[i]);
    //     }
}

// var fecharandom = new Date();
//        infoCalendario = [{
//            "mes": 201810,
//            "dayStatus": new Array(31)
//        }];


var timeouts;

function highlight(ele, newcolor) {
    var og = ele.style.borderColor;
    if (ele.style.transition != "all 50ms ease 0s") {
        setTimeout(function () {

            ele.style.transition = "all 600ms ease-out";
            ele.style.borderColor = og;
            setTimeout(function () {
                ele.style.transition = null;
            }, 2000);

        }, 400);

        ele.style.transition = "all 50ms";
        ele.style.borderColor = newcolor;
    }
}

function highlightBg(ele, newcolor) {
    var og = ele.style.backgroundColor;
    if (ele.style.transition != "all 50ms ease 0s") {
        setTimeout(function () {

            ele.style.transition = "all 800ms ease-out";
            ele.style.backgroundColor = og;
            setTimeout(function () {
                ele.style.transition = null;
            }, 1000);

        }, 200);

        ele.style.transition = "all 50ms";
        ele.style.backgroundColor = newcolor;
    }
}

function setStatusInd(new_status, box) {
    status_ind = new_status;
    highlight(box, "#BB2233");
}

window.onload = function () {

    initStorage();

    reloadCalendar();

    reloadStorageTA();

};