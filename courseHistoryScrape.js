var page = require('webpage').create();
var system = require('system');
var username = system.args[1];
var password = system.args[2];
var loadInProgress = false;
var testindex = 0,
output = { errors: [], results: [] };

// for debugging purpose
page.onLoadStarted = function() {
    loadInProgress = true;
    
};

page.onLoadFinished = function(status) {
    loadInProgress = false;
    if (status !== 'success') {
        
        phantom.exit();
    } else {
        
    }
};


var steps = [
    function() {
        page.open('https://login.psft.ust.hk/cas/login?method=POST&service=https%3A%2F%2Fsisprod.psft.ust.hk%2Fpsp%2FSISPROD%2FEMPLOYEE%2FHRMS%2Fc%2FSA_LEARNER_SERVICES.SSS_STUDENT_CENTER.GBL%3Fpslnkid%3DZ_HC_SSS_STUDENT_CENTER_LNK%26FolderPath%3DPORTAL_ROOT_OBJECT.Z_HC_SSS_STUDENT_CENTER_LNK%26IsFolder%3Dfalse%26IgnoreParamTempl%3DFolderPath%252cIsFolder%26cmd%3Dlogin%26languageCd%3DENG%26userid%3Dcasproxy%26pwd%3Dna', 'GET', function(status) {
        page.includeJs('https://cdnjs.cloudflare.com/ajax/libs/headjs/1.0.3/head.min.js', function() {
 // Inputting the username and password and clicking the submit button
            page.evaluate(function(username, password) {
            document.getElementById('username').value = username; 
            document.getElementById('password').value = password;
document.getElementsByName("submit")[0].disabled = false;
	document.getElementsByName("submit")[0].click();
            
        }, username, password);
	});
	});
    },
    function() {
// importing jquery
   	page.injectJs('jquery-1.11.1.min.js');
// screenshotting the output on the phantomjs browser
	page.render('output1.png');
	
        page.evaluate(function() {
        });
    },
function() {
         
   	page.injectJs('jquery-1.11.1.min.js');
// navigate to the course history page
	page.open('https://sisprod.psft.ust.hk/psc/SISPROD/EMPLOYEE/HRMS/c/SA_LEARNER_SERVICES.SSS_MY_CRSEHIST.GBL?Page=SSS_MY_CRSEHIST&Action=U&ForceSearch=Y');
        page.evaluate(function() {
        });
    },
   function() {
        
// taking another screenshot to make sure login is successful
	page.render('output2.png');
	
        var cells = page.evaluate(function(){
            try {
// to get all the course history rows
                var cells = document.querySelectorAll('.PSLEVEL1GRIDWBO tr td');
				
                return Array.prototype.map.call(cells, function(cell) {
			if (cell.getElementsByTagName('img').length != 0) {
				return cell.getElementsByTagName('img')[0].alt;
			} else {
				return cell.innerText;
			}
		});
            } catch (e) {
                return [];
            }
        });
        if (!cells || !cells.length > 0) {
            output.errors.push('No valid meteo data found');
        } else {
		var length = cells.length;
		length = length/6;
		var results = [];
		for (var i = 0; i < length; i++) {
			var temp = cells.splice(0,6);
			results[i] = {
				Course: temp[0],
				Description: temp[1],
                		Term: temp[2],
                		Grade: temp[3],
                		Units: temp[4],
				Status: temp[5]
			};
			
		};
		output.results.push(results);
        }
// returning the result
        console.log(JSON.stringify(output, null, '    '));
    },
    function() {
        
    }
];

// use for debugging
interval = setInterval(function() {
    if (!loadInProgress && typeof steps[testindex] == "function") {
        
        steps[testindex]();
        testindex++;
    }
    if (typeof steps[testindex] != "function") {
        
        phantom.exit();
    }
}, 20000);
