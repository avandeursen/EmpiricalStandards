//This function reads in the file name and passes it onto the next method
function getParameterByName(param_name, url = window.location.href){
	var params = location.search&&location.search.substr(1).replace(/\+/gi," ").split("&");
	var param_values = [];
	var i = 0;
	for (var param_index in params){
		var param = params[param_index].split("=");
		if(param[0] === param_name){
			param_values[i] = "\"" + unescape(param[1]) + "\"";
			i++;
		}
	}
	return param_values;
}
//Generate relative path for each standard document
function readSpecificEmpiricalStandard(standard_name){
	var mdFile = new XMLHttpRequest();
	var loc = window.location.pathname;
	var dir = loc.substring(0, loc.lastIndexOf('/'));
	var dir = dir.substring(0, dir.lastIndexOf('/'));
	var standard_file_name = standard_name.replaceAll("\"", "").replace(" ", "");
	var standard_file_path = dir + "/docs/" + standard_file_name + ".md";
	var empirical_standard = "";
	mdFile.open("GET", standard_file_path, false);
	mdFile.onreadystatechange = function(){
		if (mdFile.readyState === 4){
			if (mdFile.status === 200  || mdFile.status == 0)
				empirical_standard = mdFile.responseText;
			else
				alert("Can't read " + standard_file_path);
		}
		else
			alert("Can't read " + standard_file_path);
	}
	mdFile.send(null);
	return empirical_standard;
}

//This function creates tooltips for text
// Anything between / and / are known as regular expressions
function createTooltip(checklistItemText, line_text, footnotes){
	footnote_sups = line_text.match(/(.*?)\{sup\}\[\d+\]\(#[\w\d_]+\)\{\/sup\}(.*?)/g);
	if(footnote_sups){
		footnote_rest = line_text.match(/(?!.*\})(.*?)$/g);
		footnote_rest = footnote_rest.filter(function (el) {
			return el.trim() != "";
		});
		checklistItemText.innerHTML = checklistItemText.innerHTML.replace("<br>", "");
		var allTooltipsText = checklistItemText;
		var i = 0;
		for (let footnote_sup of footnote_sups){
			i++;
			ftnt = footnote_sup.match(/(.*?)\{sup\}(.*?)\{\/sup\}(.*?)/);
			var tooltip = document.createElement("span");
			tooltip.className = "tooltip";
			tooltip.innerHTML = ftnt[1].trim();

			var tooltipText = document.createElement("span");
			tooltipText.className = "tooltiptext";
			tooltipText.innerHTML = fromMDtoHTMLformat(footnotes[ftnt[2]]);			
			tooltip.appendChild(tooltipText);
			allTooltipsText.appendChild(tooltip);
		}
		if(footnote_rest.length > 0){
			var tooltip = document.createElement("span");
			tooltip.innerHTML = footnote_rest[0].trim();
			allTooltipsText.appendChild(tooltip);
		}
		return allTooltipsText;
	}
	return checklistItemText;
}

//The text from the MD file is converted to HTML using this method
function fromMDtoHTMLformat(text){
	// Bold text
	if (text.match(/\*\*(.*?)\*\*/g) != null)
		text = text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

	// Italic text
	if (text.match(/\*(.*?)\*/g) != null)
		text = text.replace(/\*(.*?)\*/g, "<i>$1</i>");

	// Supplements
	if (text.match(/\[([\w\s\d\.\-#\*_\/]+)\]\(((?:\/|https?:\/\/)[\w\d./?=#]+)\)/g) != null)
		text = text.replace(/\[([\w\s\d\.\-#\*_\/]+)\]\(((?:\/|https?:\/\/)[\w\d./?=#]+)\)/g, "<a target='_blank' href='$2'>$1</a>");

	return text;
}

//This function is primarily responsible for controlling the displaying of the deviation blocks
// in the checklist.
function show_hide_accept_message() {
	role = getParameterByName('role');
	checklist_yes_not_checked_count = $('input[class="checklistRadioYes"][type="radio"][value="yes"]').not(':checked').length;
	checklist_no_checked_count = $('input[class="checklistRadioNo"][type="radio"][value="no"]:checked').length;
	deviation_yes_checked_count = $('input[class="deviationRadioYes"][type="radio"][value="yes"]:checked').length;
	justification_yes_checked_count = $('input[class="justificationRadioYes"][type="radio"][value="yes"]:checked').length;
	justification_no_checked_count = $('input[class="justificationRadioNo"][type="radio"][value="no"]:checked').length;

	//check if the role selected is 'reviewer' (one-phase or two-phase)
	if (role == "\"reviewer\""){
		if (checklist_yes_not_checked_count == checklist_no_checked_count & checklist_no_checked_count == (deviation_yes_checked_count+justification_yes_checked_count+justification_no_checked_count))
			document.getElementById("checklist_submit").disabled = false;
		else
			document.getElementById("checklist_submit").disabled = true;
	}

	//check if all 'yes' are checked
	if(checklist_yes_not_checked_count == checklist_no_checked_count & checklist_no_checked_count == (deviation_yes_checked_count+justification_yes_checked_count)){
		document.getElementById("accept_manuscript").style.display = "block";
		//document.getElementById("deviation_unreasonable").style.display = "block";
		if (role == "\"reviewer\""){
			document.getElementById("deviation_unreasonable").style.display = "none";
			if (justification_yes_checked_count > 0 & justification_no_checked_count == 0)
				document.getElementById("deviation_reasonable").style.display = "block";
			else
				document.getElementById("deviation_reasonable").style.display = "none";
			document.getElementById("Desirable").style.display = "block";
			document.getElementById("Extraordinary").style.display = "block";
		}
	}
	else{
		document.getElementById("accept_manuscript").style.display = "none";
		if (role == "\"reviewer\""){
			document.getElementById("Desirable").style.display = "none";
			document.getElementById("Extraordinary").style.display = "none";
			if (justification_no_checked_count == 0 & justification_yes_checked_count == 0){
				document.getElementById("deviation_reasonable").style.display = "none";
				document.getElementById("deviation_unreasonable").style.display = "none";
			}
			else if (justification_no_checked_count > 0 & checklist_yes_not_checked_count == checklist_no_checked_count){
				document.getElementById("deviation_reasonable").style.display = "none";
				document.getElementById("deviation_unreasonable").style.display = "block";
			}
			else if (justification_yes_checked_count > 0 & checklist_yes_not_checked_count == checklist_no_checked_count){
				document.getElementById("deviation_unreasonable").style.display = "none";
				document.getElementById("deviation_reasonable").style.display = "block";
			}
		}
	}
}
//this function manages the display of the deviation block, which is dependent upon user input
function show_deviation_block() {
	id = this.id.replace("checklist-radio:No:", "")
	var block = document.getElementById("deviation_block:" + id);
	block.style.display = "block";
	show_hide_accept_message();
}
//this function manages the display of the deviation block, which is dependent upon user input
function hide_deviation_block() {
	id = this.id.replace("checklist-radio:Yes:", "")
	hide_other_messages(id);
	var block = document.getElementById("deviation_block:" + id);
	block.style.display = "none";
	var block = document.getElementById("deviation_justified:" + id);
	block.style.display = "none";
	var block = document.getElementById("deviation_not_justified:" + id);
	block.style.display = "none";
	deviation_radio_name = this.name.replace("checklist-radio", "deviation_block-radio");
	if(document.getElementsByName(deviation_radio_name).length > 0){
		document.getElementsByName(deviation_radio_name)[0].checked = false;
		document.getElementsByName(deviation_radio_name)[1].checked = false;
	}
	deviation_radio_name = this.name.replace("checklist-radio", "deviation_justified-radio");
	if(document.getElementsByName(deviation_radio_name).length > 0){
		document.getElementsByName(deviation_radio_name)[0].checked = false;
		document.getElementsByName(deviation_radio_name)[1].checked = false;
	}
	deviation_radio_name = this.name.replace("checklist-radio", "deviation_not_justified-radio");
	if(document.getElementsByName(deviation_radio_name).length > 0){
		document.getElementsByName(deviation_radio_name)[0].checked = false;
		document.getElementsByName(deviation_radio_name)[1].checked = false;
	}

	show_hide_accept_message();
}

function hide_other_messages(id) {
	try {
		document.getElementById("deviation_reasonable:" + id).style.display = "none";
		document.getElementById("deviation_unreasonable:" + id).style.display = "none";
		document.getElementById("justification_reasonable:" + id).style.display = "none";
		document.getElementById("justification_unreasonable:" + id).style.display = "none";
	}
	catch(err) {}
}

//this function creates a deviation block for all Essential items in the standards
function deviation_justification() {
	// (No-Yes) deviation is justified
	if(this.id.includes("deviation_block-radio:Yes:")){
		id = this.id.replace("deviation_block-radio:Yes:", "")
		hide_other_messages(id);
		var block = document.getElementById("deviation_not_justified:" + id);
		block.style.display = "none";
		var block = document.getElementById("deviation_justified:" + id);
		block.style.display = "block";
		deviation_radio_name = this.name.replace("deviation_block-radio", "deviation_not_justified-radio");
		if(document.getElementsByName(deviation_radio_name).length > 0){
			document.getElementsByName(deviation_radio_name)[0].checked = false;
			document.getElementsByName(deviation_radio_name)[1].checked = false;
		}
	}
	// (No-No) deviation is unjustified
	else if(this.id.includes("deviation_block-radio:No:")){
		id = this.id.replace("deviation_block-radio:No:", "")
		hide_other_messages(id);
		var empty_message = document.getElementById("deviation_justified:" + id);
		empty_message.style.display = "none";
		var message = document.getElementById("deviation_not_justified:" + id);
		message.style.display = "block";
		deviation_radio_name = this.name.replace("deviation_block-radio", "deviation_justified-radio");
		if(document.getElementsByName(deviation_radio_name).length > 0){
			document.getElementsByName(deviation_radio_name)[0].checked = false;
			document.getElementsByName(deviation_radio_name)[1].checked = false;
		}
	}
	else{
		// (No-Yes-Yes) => deviation is justified and justification is reasonable
		if(this.id.includes("deviation_justified-radio:Yes:")){
			id = this.id.replace("deviation_justified-radio:Yes:", "")
			hide_other_messages(id);
			var message = document.getElementById("justification_reasonable:" + id);
			message.style.display = "block";
		}
		// (No-Yes-No) => deviation is justified but justification is unreasonable
		else if(this.id.includes("deviation_justified-radio:No:")){
			id = this.id.replace("deviation_justified-radio:No:", "")
			hide_other_messages(id);
			var message = document.getElementById("justification_unreasonable:" + id);
			message.style.display = "block";
		}
		// (No-No-Yes) => deviation is unjustified but reasonable
		else if(this.id.includes("deviation_not_justified-radio:Yes:")){
			id = this.id.replace("deviation_not_justified-radio:Yes:", "")
			hide_other_messages(id);
			var message = document.getElementById("deviation_reasonable:" + id);
			message.style.display = "block";
		}
		// (No-No-No) => deviation is unjustified and unreasonable
		else if(this.id.includes("deviation_not_justified-radio:No:")){
			id = this.id.replace("deviation_not_justified-radio:No:", "")
			hide_other_messages(id);
			document.getElementById("deviation_unreasonable:" + id).style.display = "block";
		}
	}
	show_hide_accept_message();
}

function generate_question_block_with_yes_no_radio_answers(id, class_name, question, checklistItem_id, padding) {
	var question_block = document.createElement("div");
	question_block.id = id + ":" + checklistItem_id;
	question_block.className = "question_block";
	question_block.style = "padding-left:"+padding+"em; display:none";
	question_block.innerHTML = "&rdsh;&nbsp; " + question;
	var deviation_block_radios = document.createElement("div");
	var deviationRadioYes = document.createElement("input");
	var deviationRadioNo = document.createElement("input");
	var deviationLabelYes = document.createElement("label");
	var deviationLabelNo = document.createElement("label");
	deviationRadioYes.id = id + "-radio:Yes:" + checklistItem_id;
	deviationRadioNo.id = id + "-radio:No:" + checklistItem_id;
	deviationRadioYes.className = class_name + "Yes";
	deviationRadioNo.className = class_name + "No";
	deviationRadioYes.name = id + "-radio:" + checklistItem_id;
	deviationRadioNo.name = id + "-radio:" + checklistItem_id;
	deviationRadioYes.onclick = deviation_justification;
	deviationRadioNo.onclick = deviation_justification;
	deviationRadioYes.type = "radio";
	deviationRadioNo.type = "radio";
	deviationRadioYes.value = "yes";
	deviationRadioNo.value = "no";
	deviation_block_radios.innerHTML = "&nbsp;&nbsp;&nbsp;";
	deviationLabelYes.innerHTML = "yes&nbsp;&nbsp;";
	deviationLabelNo.innerHTML = "no";
	deviationLabelYes.htmlFor = deviationRadioYes.id;
	deviationLabelNo.htmlFor = deviationRadioNo.id;
	deviation_block_radios.appendChild(deviationRadioYes);
	deviation_block_radios.appendChild(deviationLabelYes);
	deviation_block_radios.appendChild(deviationRadioNo);
	deviation_block_radios.appendChild(deviationLabelNo);
	question_block.appendChild(deviation_block_radios);

	return question_block;
}

function generate_message(id, color, text, padding, indent) {
	var message = document.createElement("div");
	message.id = id;
	message.className = "message";
	message.innerHTML = text;
	message.style = "color:" + color + "; padding-left:"+padding+"em; text-indent:"+indent+"em; display:none";

	return message;
}

function generate_author_deviation_block(checklistItem_id) {
	var deviation_block = generate_question_block_with_yes_no_radio_answers("deviation_block", "deviationRadio", "does the manuscript justify the deviation?", checklistItem_id, 2.4);

	// Author-specific deviation justification message
	var deviation_justified = generate_message("deviation_justified:" + checklistItem_id, "red", "", 0.65, -1);

	var deviation_not_justified = generate_message("deviation_not_justified:" + checklistItem_id, "red", "&rdsh;&nbsp; the manuscript should either conform to the standard or clearly explain why it deviates from the standard", 0.65, -1);

	deviation_block.appendChild(deviation_justified);
	deviation_block.appendChild(deviation_not_justified);

	return deviation_block;
}

function generate_ease_reviewer_deviation_block(checklistItem_id) {
	var deviation_block = generate_question_block_with_yes_no_radio_answers("deviation_block", "deviationRadio", "<div class=\"tooltip\"> is the deviation reasonable?<span class=\"tooltiptext\">If the manuscript justifies the deviation, consider the justification offered.</span></div>", checklistItem_id, 2.4);

	// Author-specific deviation justification message
	var deviation_justified = generate_message("deviation_justified:" + checklistItem_id, "black", "<b>OK</b>. Not grounds for rejection", 0.65, -1);

	var deviation_not_justified = generate_message("deviation_not_justified:" + checklistItem_id, "red", "&rdsh;&nbsp; Explain in your review why the deviation is unreasonable and suggest possible fixes. REJECT unless fixes are trivial.", 0.65, -1);

	deviation_block.appendChild(deviation_justified);
	deviation_block.appendChild(deviation_not_justified);
	return deviation_block;
}
function generate_reviewer_deviation_block(checklistItem_id) {
	var deviation_block = generate_question_block_with_yes_no_radio_answers("deviation_block", "deviationRadio", "is the deviation reasonable?", checklistItem_id, 2.40);

	// Reviewer-specific deviation justification block
	//var deviation_justified = generate_question_block_with_yes_no_radio_answers("deviation_justified", "deviationRadio", "", checklistItem_id, 2.06);
	var deviation_justified = generate_message("deviation_justified:" + checklistItem_id, "red", "", 2.80, -1.07);

	var deviation_not_justified = generate_question_block_with_yes_no_radio_answers("deviation_not_justified", "justificationRadio", "<div class=\"tooltip\"> can it be trivially fixed?<span class=\"tooltiptext\">Fixable in one or two hours e.g rewriting a paragraph.</span></div>", checklistItem_id, 2.06);

	// (No-No-Yes)
	var deviation_reasonable = generate_message("deviation_reasonable:" + checklistItem_id, "red", "", 0, 0);

	// (No-No-No)
	var deviation_unreasonable = generate_message("deviation_unreasonable:" + checklistItem_id, "red", "", 0, 0);

	deviation_block.appendChild(deviation_justified);
	deviation_block.appendChild(deviation_not_justified);

	deviation_block.appendChild(deviation_reasonable);
	deviation_block.appendChild(deviation_unreasonable);

	return deviation_block;
}

function convert_standard_checklists_to_html_checklists(standardName, checklistName, checklistText, footnotes){
	var checklists = document.createElement("UL");
	var standard_H3 = document.createElement("B");
	standard_H3.style = "font-size:20px;";
	standard_H3.innerHTML = standardName + ":";
	if (checklistName == "Essential")
		checklists.style = "list-style-type:none; list-style-position:inside; padding-left:1.2em; text-indent:-2.4em;";
	else
		checklists.style = "list-style-type:none; list-style-position:inside; padding-left:0em; text-indent:-1.3em;";

	//checklists.appendChild(standard_H3); //no subheadings
	lines = checklistText.includes("- [ ]") ? checklistText.split("- [ ]") : checklistText.includes("-	") ? checklistText.split("-	") : checklistText.split("");
	var i = 0;

	for(let line of lines){
		line_text = line.trim().replaceAll(" ", "").replaceAll("<br>", "").replaceAll("<br/>", "").replaceAll("\t", "");
		if (line_text != ""){
			i++;
			line_text = line.trim().replace("---", "&mdash;").replace(/<br(\/)?>$/, "");
			checklistItem_id = standardName + "-" + checklistName + ":" + i;
			var checklistItemLI = document.createElement("LI");
			var checklistItemText = document.createElement("span");

			//we dont need this part in the checklist
			if(line_text.includes("complies with all applicable empirical standards"))
				continue;
			checklistItemLI.setAttribute("text", line_text);
			if(line_text.includes("footnote"))
				checklistItemText = createTooltip(checklistItemText, line_text, footnotes);
			else
				checklistItemText.innerHTML = "&nbsp;" + line_text;

			if (checklistName == "Essential"){
				var checklistRadioYes = document.createElement("input");
				var checklistRadioNo = document.createElement("input");
				checklistRadioYes.id = "checklist-radio:Yes:" + checklistItem_id;
				checklistRadioNo.id = "checklist-radio:No:" + checklistItem_id;
				checklistRadioYes.className = "checklistRadioYes";
				checklistRadioNo.className = "checklistRadioNo";
				checklistRadioYes.name = "checklist-radio:" + checklistItem_id;
				checklistRadioNo.name = "checklist-radio:" + checklistItem_id;
				checklistRadioYes.onclick = hide_deviation_block;
				checklistRadioNo.onclick = show_deviation_block;
				checklistRadioYes.type = "radio";
				checklistRadioNo.type = "radio";
				checklistRadioYes.value = "yes";
				checklistRadioNo.value = "no";

				// Generate a deviation block
				var deviation_block;
				if(role == "\"author\"")
					deviation_block = generate_author_deviation_block(checklistItem_id);
				else if(role == "\"ease-reviewer\"")
					deviation_block = generate_ease_reviewer_deviation_block(checklistItem_id);
				else if(role == "\"reviewer\"")
					deviation_block = generate_reviewer_deviation_block(checklistItem_id);

				checklistItemText.appendChild(deviation_block);

				checklistItemLI.appendChild(checklistRadioYes);
				checklistItemLI.appendChild(checklistRadioNo);
				checklistItemLI.appendChild(checklistItemText);
			}
			else{
				var checkboxInput = document.createElement("input");
				checkboxInput.type = "checkbox";
				checkboxInput.id = checklistItem_id;
				checkboxInput.name = checklistItem_id;
				checkboxInput.style = "color:#FFF";
				checkboxInput.value = line_text;
				checklistItemLI.appendChild(checkboxInput);
				checklistItemLI.appendChild(checklistItemText);
			}

			checklists.appendChild(checklistItemLI);
		}
	}
	return checklists;
}
//sorting all the standards, engineering research and mixed methods always displayed before any other standards regardless of any input
function sortStandards(keys){
	var sorted_keys = [];
	if (keys.includes("\"Engineering Research\"")){
		sorted_keys.push("\"Engineering Research\"")
		keys.splice(keys.indexOf("\"Engineering Research\""), 1);
	}
	if (keys.includes("\"Mixed Methods\"")){
		sorted_keys.push("\"Mixed Methods\"")
		keys.splice(keys.indexOf("\"Mixed Methods\""), 1);
	}
	sorted_keys = sorted_keys.concat(keys.sort());
	return sorted_keys;
}

function generateStandardChecklist(){
	standard_keys = getParameterByName('standard');
	standard_keys = sortStandards(standard_keys);
	role = getParameterByName('role');
	
	var wrappers = document.getElementsByClassName('wrapper');
	var wrapper = null;
	if (wrappers.length > 0)
		wrapper = wrappers[1];

	var container = document.createElement("DIV");
	container.id = "container";

	var heading = document.createElement("H1");
	if(role == "\"author\"")
		heading.innerHTML = "Pre-Submission Checklist";
	else if(role == "\"ease-reviewer\"")
		heading.innerHTML = "Reviewer Checklist";
	else if(role == "\"reviewer\"")
		heading.innerHTML = "Reviewer Checklist";


	var form = document.createElement("FORM");
	form.id = "checklists";
	form.name = "checklists";

	var EssentialUL = document.createElement("UL");
	var EssentialH2 = document.createElement("H3");
	EssentialUL.id = "Essential";
	EssentialUL.style = "padding: 0px;";
	EssentialH2.style = "padding: 0px; margin: 0px; text-indent: -0.3em;";
	EssentialH2.innerHTML = "Essential";
	EssentialUL.appendChild(EssentialH2);

	var DesirableUL = document.createElement("UL");
	var DesirableH2 = document.createElement("H3");
	DesirableUL.id = "Desirable";
	DesirableUL.style = "padding: 0px;";
	DesirableH2.style = "padding: 0px; margin: 0px; text-indent: -0.3em;";
	DesirableH2.innerHTML = "Desirable";
	DesirableUL.appendChild(DesirableH2);
	if(role == "\"reviewer\"")
		DesirableUL.style = "padding: 0px; display:none;";

	var ExtraordinaryUL = document.createElement("UL");
	var ExtraordinaryH2 = document.createElement("H3");
	ExtraordinaryUL.id = "Extraordinary";
	ExtraordinaryUL.style = "padding: 0px;";
	ExtraordinaryH2.style = "padding: 0px; margin: 0px; text-indent: -0.3em;";
	ExtraordinaryH2.innerHTML = "Extraordinary";
	ExtraordinaryUL.appendChild(ExtraordinaryH2);
	if(role == "\"reviewer\"")
		ExtraordinaryUL.style = "padding: 0px; display:none;";

	if (!standard_keys.includes("\"General Standard\""))
		standard_keys.unshift("\"General Standard\"");
	var i = 0;
	for (let key of standard_keys){
		i++;
		empirical_standard = readSpecificEmpiricalStandard(key);
		var dom = document.createElement("div");
		dom.innerHTML = empirical_standard;
		var standardTag = dom.getElementsByTagName("standard")[0];
		var footnoteTags = dom.getElementsByTagName("footnote");
		var footnotes = {};

		for(let footnoteTag of footnoteTags){
			supTag = footnoteTag.getElementsByTagName("sup")[0];
			footnote_id = supTag.innerText.trim()
			supTag.remove();
			footnotes[footnote_id] = footnoteTag.innerText.trim();
		}

		let standardName = "\"" + standardTag.getAttribute('name') + "\"";
		standardName = standardName.replaceAll("\"", "");
		/*var standardTitle = document.createElement("H2");
		standardTitle.innerHTML = standardName;
		form.appendChild(standardTitle);*/
		var checklistTags = standardTag.getElementsByTagName("checklist");
		for (let checklistTag of checklistTags){
			// Reformat the checklists from MD to HTML
			checklistTag.innerHTML = checklistTag.innerHTML.replaceAll("<sup>", "{sup}").replaceAll("</sup>", "{/sup}");
			checklistText = checklistTag.innerText.replaceAll(">", "").replaceAll("\n", "<br/>");
			checklistText = fromMDtoHTMLformat(checklistText);

			checklistText = checklistText.replaceAll('https://github.com/acmsigsoft/EmpiricalStandards/blob/master/docs/', '../docs?standard=').replaceAll('.md', '');
			checklistText = checklistText.replaceAll('https://github.com/acmsigsoft/EmpiricalStandards/blob/master/Supplements/', '../Supplements?supplement=').replaceAll('.md', '');

			checklists = convert_standard_checklists_to_html_checklists(standardTag.getAttribute('name'), checklistTag.getAttribute('name'), checklistText, footnotes)
			var Yes_No = document.createElement("div");
			var standard_header_rule = document.createElement("div");
			var standard_header_text = document.createElement("span");
			standard_header_rule.className = "standardHeaderRule";
			standard_header_text.className = "standardHeaderText";
			//standard_header_text.innerText = standardName;
			Yes_No.style = "align:center; font-size: 80%; font-weight: bold;";
			Yes_No.innerHTML = "&nbsp;yes no";
			standard_header_rule.appendChild(standard_header_text);
			if (checklistTag.getAttribute('name') == "Essential") {
				//EssentialUL.appendChild(standard_header_rule);
				if (i == 1)
					EssentialUL.appendChild(Yes_No);
				EssentialUL.appendChild(checklists);
			}
			else if (checklistTag.getAttribute('name') == "Desirable") {
				//DesirableUL.appendChild(standard_header_rule);
				DesirableUL.appendChild(checklists);
			}
			else if (checklistTag.getAttribute('name') == "Extraordinary") {
				//ExtraordinaryUL.appendChild(standard_header_rule);
				ExtraordinaryUL.appendChild(checklists);
			}
		}
	}
	form.appendChild(EssentialUL);

	var submit = document.createElement("button");
	submit.innerHTML = "Download";
	submit.id = "checklist_submit";
	submit.name = "checklist_submit";
	submit.disabled = true;
	submit.onclick = saveFile;

	// (All 'Yes' -> accept manuscript)
	var accept_manuscript = generate_message("accept_manuscript", "red", (role != "\"author\"" ? "The manuscript meets all essential criteria: ACCEPT." : ""), 2, 0);
	form.appendChild(accept_manuscript);

	if(role == "\"reviewer\""){
		// (At least one 'No-No-No' -> reject manuscript)
		var deviation_unreasonable = generate_message("deviation_unreasonable", "red", "<b>REJECT</b>. In your review please explain the deviations and why they are not reasonable. Give constructive suggestions.", 2, 0);
		form.appendChild(deviation_unreasonable);

		// (At least one 'No-No-Yes' -> explain fix)
		var deviation_reasonable = generate_message("deviation_reasonable", "red", "Explain how the manuscript should be fixed.", 2, 0);
		form.appendChild(deviation_reasonable);

		if(deviation_unreasonable.style.display == "block"){
			submit.disabled = false;
		}
	}

	form.appendChild(DesirableUL);
	form.appendChild(ExtraordinaryUL);

	if(role == "\"reviewer\"") {
		form.appendChild(submit);
	}
	container.appendChild(heading);
	container.appendChild(form);

	BR = document.createElement("BR");
	HR = document.createElement("HR");
	container.appendChild(HR);

	var for_more_info = document.createElement("H2");
	for_more_info.innerHTML = "For more information, see:";
	container.appendChild(for_more_info);
	var standards_path = "../docs?standard="
	var UL = document.createElement("UL");
	for (let key of standard_keys){
		key = key.replaceAll("\"", "");
		var LI = document.createElement("LI");
		var LINK = document.createElement("A");
		LINK.innerHTML = key;
		LINK.href = standards_path + key.replaceAll(" ", "");
		LINK.target = "_blank";
		LINK.style = "font-size:23px;";
		LINK.id = "standardNames";
		LI.appendChild(LINK);
		UL.appendChild(LI);
	}
	container.appendChild(UL);

	if (wrapper == null)
		document.body.appendChild(container);
	else
		wrapper.appendChild(container);
		
}
//download the file as a checklist
function saveFile(){
	var checklists = document.getElementById('checklists');
	var generated_text = '=================\n' +
		'Review Checklist\n' +
		'=================\n';
		
	var accept = document.getElementById("accept_manuscript");
	var unreasonable = document.getElementById("deviation_unreasonable");
	var reasonable = document.getElementById("deviation_reasonable");

	if(accept.style.display == "block")
		generated_text += "\n" + accept.innerText + "\n";
	else if(unreasonable.style.display == "block")
		generated_text += "\n" + unreasonable.innerText + "\n";

	if(reasonable.style.display == "block")
		generated_text += reasonable.innerText + "\n";
	else
		generated_text += "";
	
	for (let list of checklists.children) {
		if(list.tagName.toLowerCase() == 'ul' & list.style.display != 'none'){
			generated_text += '\n' + list.id + '\r\n';
			for (let ul of list.children) {
				if(ul.tagName.toLowerCase() == 'ul'){
					var i = 0;
					for (let li of ul.children) {
						i++;
						var li_text = li.getAttribute("text");
						var regex = /<a+\n*.+<\/a>/g;
						if (li_text.match(regex) != null)
							li_text = li_text.replace(regex, "");

						var regex2 = /\{sup\}.+\{\/sup\}/g;
						var regex3 = /<br\/>/g;
						var regex4 = /<\/b>/g;
						var regex5 = /<b>/g;
						var regex6 = /[\r\n]+/g;
						var regex7 =/ \(.+\)/g;
						var regex8 = /<i>/g;
						var regex9 = /<\/i>/g;

						if (li_text.match(regex2) != null)
							li_text = li_text.replace(regex2, "");
						if (li_text.match(regex3) != null)
							li_text = li_text.replace(regex3,"\n");
						if (li_text.match(regex4) != null)
							li_text = li_text.replace(regex4,"");
						if (li_text.match(regex5) != null)
							li_text = li_text.replace(regex5,"");
						if (li_text.match(regex6) != null)
							li_text = li_text.replace(regex6,"");
						if (li_text.match(regex7) != null)
							li_text = li_text.replace(regex7,"");
						if (li_text.match(regex8) != null)
							li_text = li_text.replace(regex8,"");
						if (li_text.match(regex9) != null)
							li_text = li_text.replace(regex9,"");

						if (list.id == 'Essential'){
							if (li.children[0].checked)
								generated_text +=  'Y' + '\t   ' + li_text + '\r\n';
							else{
								var reasonable_deviation = li.getElementsByClassName('deviationRadioYes')[0];
								if (reasonable_deviation.checked)
									generated_text += 'R' + '\t   ' + li_text + '\r\n';
								else{
									var fixable_deviation = li.getElementsByClassName('justificationRadioYes')[0];
									generated_text += (fixable_deviation.checked ? 'F' : 'U') + '\t   ' + li_text + '\r\n';
								}
							}
						}
						else
							generated_text += (li.children[0].checked ? 'Y' : 'N') + '\t   ' + li_text + '\r\n';
					}
				}
			}
		}
	}

	generated_text += "\n" +
		"=======\n" +
		"Legend\n" +
		"=======\n" +
		"Y = Yes, the paper has this attribute\n" +
		"R = Reasonable deviation\n" +
		"F = (easily) Fixable deviation\n" +
		"U = Unfixable (or not easily fixable) deviation\n" +
		"N = No, the paper does not have this attribute\n\n\n";

	generated_text+= "=================\n" +
		"Standards Used\n" +
		"=================\n";

	var elms = document.querySelectorAll("[id='standardNames']");
	for(var i = 0; i < elms.length; i++)
		generated_text += elms[i].innerHTML + '\n';

	pageURL = window.location.href;
	generated_text += "\nURL: " + pageURL;

	var newLink = document.createElement('a');
	newLink.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(generated_text);
	newLink.download = 'reviewChecklist.txt';

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        newLink.dispatchEvent(event);
    }
    else
        newLink.click();
	return false;
}