mineCTBP = function(colorCode) {
    if (colorCode == "green" || colorCode == 01 ||  colorCode == "01") {
        return "-550px 0px";
    }
    if (colorCode == "red" || colorCode == 02 ||  colorCode == "02") {
        return "-550px -100px";
    }
    console.log("mineCTBP: default case");
    return false;
}

battlefieldCTBP = function(colorCode) {
    if (colorCode == "green" || colorCode == 01 ||  colorCode == "01") {
        return "-220px 0px";
    }
    if (colorCode == "red" || colorCode == 02 ||  colorCode == "02") {
        return "-220px -100px";
    }
    console.log("battlefieldCTBP: default case");
    return false;
}

resourcesCTBP = function(colorCode, sr) {
    // GREEN
    if ((colorCode == "green" || colorCode == 01 ||  colorCode == "01") && sr == "-1") {
        return "-1660px -0px";
    }
    if ((colorCode == "green" || colorCode == 01 ||  colorCode == "01") && sr == "1") {
        return "-2578px 0px";
    }
    if ((colorCode == "green" || colorCode == 01 ||  colorCode == "01") && sr == "2") {
        return "-2551px 0px";
    }
    if ((colorCode == "green" || colorCode == 01 ||  colorCode == "01") && sr == "3") {
        return "-2628px 0px";
    }
    if ((colorCode == "green" || colorCode == 01 ||  colorCode == "01") && sr == "4") {
        return "-2603px 0px";
    }
    if ((colorCode == "green" || colorCode == 01 ||  colorCode == "01") && sr == "5") {
        return "-2655px 0px";
    }
    if ((colorCode == "green" || colorCode == 01 ||  colorCode == "01") && sr == "6") {
        return "-2524px 0px";
    }

    // RED
    if ((colorCode == "red" || colorCode == 02 ||  colorCode == "02") && sr == "-1") {
        return "-1660px -55px";
    }
    if ((colorCode == "red" || colorCode == 02 ||  colorCode == "02") && sr == "1") {
        return "-2578px -23px";
    }
    if ((colorCode == "red" || colorCode == 02 ||  colorCode == "02") && sr == "2") {
        return "-2551px -23px";
    }
    if ((colorCode == "red" || colorCode == 02 ||  colorCode == "02") && sr == "3") {
        return "-2628px -23px";
    }
    if ((colorCode == "red" || colorCode == 02 ||  colorCode == "02") && sr == "4") {
        return "-2603px -23px";
    }
    if ((colorCode == "red" || colorCode == 02 ||  colorCode == "02") && sr == "5") {
        return "-2655px -23px";
    }
    if ((colorCode == "red" || colorCode == 02 ||  colorCode == "02") && sr == "6") {
        return "-2524px -23px";
    }
    console.log("resourcesCTBP: default case");
    return false;
}
