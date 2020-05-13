
        function dummy(){
          
            return false;
        }
        var show = false;
        //var topHeadLines;
      
        
        function onLoadData(){
            loadData();
            getTodaysDate()
        }

        function Clear(){
           
            getTodaysDate();
            document.getElementById("keywordText").value = "";
            document.getElementById("category").value = "all";
            getDefaultSources();
            document.getElementById("showButton").style.display = "none";
            document.getElementsByClassName("final-articles")[0].style.display = "none";
            show = false;
            var initial_element = document.getElementById("initial_element");
            var final_element = document.getElementById("final_element");                
            while (initial_element.childNodes.length > 2) {
                    initial_element.removeChild(initial_element.lastChild);
            }
            while (final_element.hasChildNodes()) {
                    final_element.removeChild(final_element.lastChild);
            }
            document.getElementById("emptytag").innerHTML = "";
        }

        function collapse(data){
            let parent_node = data.parentNode;
            var new_node = data.cloneNode(true);
            new_node.className = "fullCard";
            new_node.onclick = function(e) {
                //e.stopPropagation();
                // e.preventDefault();
                if(e.target.tagName.toLowerCase() != 'a')
                    return false;
            }
            var alink = document.createElement('a');
            alink.setAttribute('class',"cross");
            alink.setAttribute('href',"#");
            alink.innerHTML = "&#x2715;"
            alink.onclick = function(){
                var parent = this.parentNode;
                var first_child = document.getElementsByClassName("searchCard")[0];
                var searchCardNode = first_child.cloneNode(true);
                searchCardNode.getElementsByClassName("searchImage")[0].src = parent.getElementsByClassName("searchImage")[0].src;
                let search_text = searchCardNode.getElementsByClassName("searchText")[0];
                search_text.getElementsByClassName("searchTitle")[0].innerHTML = parent.getElementsByClassName("searchTitle")[0].innerHTML;
                search_text.getElementsByClassName("searchDescription")[0].innerHTML = parent.getElementsByClassName("searchDescription")[0].innerHTML;
                search_text.getElementsByClassName("shortDescription")[0].innerHTML = parent.getElementsByClassName("shortDescription")[0].innerHTML;
                search_text.getElementsByClassName("searchLink")[0].href = parent.getElementsByClassName("searchLink")[0].href;
                search_text.getElementsByClassName("searchSource")[0].innerHTML = parent.getElementsByClassName("searchSource")[0].innerHTML;
                search_text.getElementsByClassName("searchDate")[0].innerHTML = parent.getElementsByClassName("searchDate")[0].innerHTML;
                search_text.getElementsByClassName("searchAuthor")[0].innerHTML = parent.getElementsByClassName("searchAuthor")[0].innerHTML;
                searchCardNode.style.display = "block";
                parent_node.replaceChild(searchCardNode,new_node)
               //new_node.replaceWith(searchCardNode);
            }
            new_node.appendChild(alink);
           
            parent_node.replaceChild(new_node,data)
            //data.replaceWith(new_node);
        }
        

        function loadData(){
            let urls = ['/getTopHeadlines', '/wordCount','/getCNNHeadlines','/getFOXHeadlines'];
            let func = [getTopHeadlines, generateWordCloud, getCNNHeadlines, getFOXHeadlines]
            // Loop through URLs and perform request
            for(let i=0; i<urls.length; i++) {
                let xhttp = new XMLHttpRequest();
                xhttp.open("GET",urls[i],true);
                xhttp.send(null);
                xhttp.onreadystatechange = function(){
                    if(xhttp.readyState==4){
                        if(xhttp.status == 200){
                            data = JSON.parse(xhttp.responseText);
                            func[i](data);
                        }
                    }
                }
            }
            getDefaultSources();

        }

        function getSources(){
            var category = document.getElementById("category").value;
            if(category=='all')
                getDefaultSources();
            else {
                let xhr = new XMLHttpRequest();
                var params = 'category=' + category;
                
                xhr.open("GET",'/getSources'+'?'+params,true)
                //Send the proper header information along with the request
                xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                xhr.onreadystatechange = function() {
                    //Call a function when the state changes.
                    if(xhr.readyState==4){
                        if(xhr.status == 200){
                            data = JSON.parse(xhr.responseText);
                            setSources(data);
                        }
                    }
                }
                xhr.send(null);
            }
        }


        // fucntion setSources(data){
        //     if(data.headlines){
        //         var sources = data.headlines.sources
        //         var sourceElement = document.getElementById('source')
        //         sourceElement.options.length = 0;
        //         var option = document.createElement('option');
        //         option.appendChild(document.createTextNode('all'));
        //         option.value = 'all';
        //         sourceElement.appendChild(option);
        //         for(let i=0;i<sources.length;i++){
        //             option = document.createElement('option');
        //             option.appendChild(document.createTextNode(sources[i].name));
        //             option.value = sources.name;
        //             sourceElement.appendChild(option);
        //         }
        //     }
        //}

        function getDefaultSources(){
            let xmlhttp = new XMLHttpRequest();
            var params = 'language=en&country=us';
            xmlhttp.open("GET",'/getDefaultSources',true)
            //Send the proper header information along with the request
            xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xmlhttp.onreadystatechange = function() {
                //Call a function when the state changes.
                if(xmlhttp.readyState==4){
                    if(xmlhttp.status == 200){
                        data = JSON.parse(xmlhttp.responseText);
                       
                        setSources(data);
                    }
                }
            }
            xmlhttp.send(params);
        }


        function setSources(data){
            if(data.headlines){
                var sources = data.headlines.sources
                var sourceElement = document.getElementById('source')
                sourceElement.options.length = 0;
                var option = document.createElement('option');
                option.appendChild(document.createTextNode('all'));
                option.value = 'all';
                sourceElement.appendChild(option);
                for(let i=0;i<sources.length;i++){
                    option = document.createElement('option');
                    option.appendChild(document.createTextNode(sources[i].name));
                    option.value = sources[i].id;
                    sourceElement.appendChild(option);
                }
            }
        }

        function generateWordCloud(myWords){
            if(myWords.headlines){
                myWords = myWords.headlines;
                var margin = {top:0, right: 0, bottom:0, left: 0},
                width = 309 - margin.left - margin.right,
                height = 237 - margin.top - margin.bottom;



                // append the svg object to the body of the page
                var svg = d3.select("#wordCloud").append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform",
                          "translate(" + margin.left + "," + margin.top + ")");

                // Constructs a new cloud layout instance. It run an algorithm to find the position of words that suits your requirements
                // Wordcloud features that are different from one word to the other must be here
                var layout = d3.layout.cloud()
                  .size([width, height])
                  .words(myWords.map(function(d) { return {text: d.word, size:Math.min(Math.max(d.size, 7),25)}; }))
                  .padding(6)        //space between words
                  .rotate(function() { return ~~(Math.random() * 2) * 90; })
                  .fontSize(function(d) { return d.size; })      // font size of words
                  .on("end", draw);
                layout.start();

                // This function takes the output of 'layout' above and draw the words
                // Wordcloud features that are THE SAME from one word to the other can be here
                function draw(words) {
                  svg
                    .append("g")
                      .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] /2 + ")")
                      .selectAll("text")
                        .data(words)
                      .enter().append("text")
                        .style("font-size", function(d) { return d.size + "px"; })
                        .style("fill", "black")
                        .attr("text-anchor", "middle")
                        .style("font-family", "Impact")
                        .attr("transform", function(d) {
                          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                        })
                        .text(function(d) { return d.text; });
                }

            }
         
        }

        function getTopHeadlines(top5all){
            makeNewsActive();
            var topHeadLines = top5all;

            // @todo YET TO DOOOOO

            if(topHeadLines.errorNote){
                document.getElementsByClassName("slide")[0].innerHTML = topHeadLines.errorNote;
            }
            else if(topHeadLines.headlines){
                var myIndex = 0;
                var array = topHeadLines.headlines;
                var slide = document.getElementsByClassName("imagee")[0];
                var title = document.getElementsByClassName("slideTitle")[0];
                var description = document.getElementsByClassName("slideDescription")[0];
                var link = document.getElementsByClassName("divLink")[0];
                carousel();
                function carousel() {
                slide.src = array[myIndex].urlToImage;
                title.innerHTML = array[myIndex].title;
                description.innerHTML = array[myIndex].description;
                link.href = array[myIndex].url;
                myIndex++;

                if(myIndex==5)
                myIndex=0;
                setTimeout(carousel,2000);
                }
            }
           
        }

        function getCNNHeadlines(top4CNN){


            // @todo YET TO DOOOOO



            if(top4CNN.errorNote){
                var card = document.getElementsByClassName("card")
                for(let i=0;i<4;i++)
                card[i].innerHTML = top4CNN.errorNote;
            }
            else if(top4CNN.headlines){
                var array = top4CNN.headlines;
                var images = document.getElementsByClassName('cardImage');
                var titles = document.getElementsByClassName('cardTitle');
                var link = document.getElementsByClassName("cnnNews divLink");
                var descriptions = document.getElementsByClassName('cardDescription');
                for(let i=0;i<top4CNN.headlines.length;i++){
                    images[i].src = array[i].urlToImage;
                    titles[i].innerHTML = array[i].title;
                    descriptions[i].innerHTML = array[i].description;
                    link[i].href = array[i].url;
                }
            }
        }


        function getFOXHeadlines(top4Fox){
            if(top4Fox.errorNote){
                var card = document.getElementsByClassName("foxnews card")
                for(let i=0;i<4;i++)
                card[i].innerHTML = top4Fox.errorNote;
            }
            else if(top4Fox.headlines){
                var array = top4Fox.headlines;
                var images = document.getElementsByClassName('foxnews cardImage');
                var titles = document.getElementsByClassName('foxnews cardTitle');
                var link = document.getElementsByClassName("foxnews divLink");
                var descriptions = document.getElementsByClassName('foxnews cardDescription');
                for(let i=0;i<top4Fox.headlines.length;i++){
                    images[i].src = array[i].urlToImage;
                    titles[i].innerHTML = array[i].title;
                    descriptions[i].innerHTML = array[i].description;
                    link[i].href = array[i].url;
                }
            }

        }

        function makeSearchActive(){
            var current = document.getElementsByClassName("active");
            current[0].className = current[0].className.replace(" active", "");
            document.getElementsByClassName("searchButton")[0].className += " active";
            document.getElementsByClassName("middleElement")[0].style.display = "None"
            document.getElementsByClassName("search")[0].style.display = 'inline-block'
        }

        function makeNewsActive(){

            var current = document.getElementsByClassName("active");
            current[0].className = current[0].className.replace(" active", "");
            document.getElementsByClassName("newsButton")[0].className += " active";
            document.getElementsByClassName("middleElement")[0].style.display = "inline-block";
            document.getElementsByClassName("search")[0].style.display = 'None'
        }


        function getTodaysDate(){
            var datetime = new Date();
            var day = String(datetime.getDate()).padStart(2, '0');
            var month = String(datetime.getMonth() + 1).padStart(2, '0'); //January is 0!
            var year = datetime.getFullYear();
            datetime = year + '-' + month + '-' + day;
            document.getElementById("myDateTo").value = datetime

            datetime = new Date();
            datetime.setDate(datetime.getDate()-7);
            day = String(datetime.getDate()).padStart(2, '0');
            month = String(datetime.getMonth() + 1).padStart(2, '0'); //January is 0!
            year = datetime.getFullYear();
            datetime = year + '-' + month + '-' + day;
            document.getElementById("myDateFrom").value = datetime
        }

        function ssss(){
            let xmlhttp = new XMLHttpRequest();
            var keyword = document.getElementById("keywordText").value;
            var from_date = document.getElementById("myDateFrom").value;
            var to_date = document.getElementById("myDateTo").value;
            var selected = document.getElementById("source")

            if(keyword == "")
                return false;
            
            if(Date.parse(to_date)<Date.parse(from_date)){
                alert("Incorrect time");
                return false;
            }
            var sources = selected.options[selected.selectedIndex].value;
            var params = 'keyword=' + keyword + '&from_date=' + from_date + '&to_date=' + to_date  + '&sources=' + sources 
            + '&sort_by=publishedAt&language=en&page_size=30';
          

            xmlhttp.open("GET",'/search' +'?'+params,true)
            //Send the proper header information along with the request
            xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xmlhttp.onreadystatechange = function() {
                //Call a function when the state changes.
                if(xmlhttp.readyState==4){
                    if(xmlhttp.status == 200){
                        data = JSON.parse(xmlhttp.responseText);

                        processSearch(data);
                    }
                }
            }
            xmlhttp.send(null);
            return false;
        }



        function processSearch(data){
            
            if(data.headlines){
                document.getElementById("showButton").style.display = "none";
                document.getElementsByClassName("final-articles")[0].style.display = "none";
                show = false;
                var initial_element = document.getElementById("initial_element");
                var final_element = document.getElementById("final_element");
                
                while (initial_element.childNodes.length > 2) {
                        initial_element.removeChild(initial_element.lastChild);
                }
                while (final_element.hasChildNodes()) {
                        final_element.removeChild(final_element.lastChild);
                }
                var first_child = document.getElementsByClassName("searchCard")[0];
                articles = data.headlines;
               
            
                if(articles.length == 0){
                        document.getElementById("emptytag").innerHTML = "No results";
                }
                else{

                    document.getElementById("emptytag").innerHTML = "";
                    total_length = Math.min(articles.length,15);
                    for(i = 0; i< total_length;i++){
                        var next_child = first_child.cloneNode(true);
                        next_child.getElementsByClassName("searchImage")[0].src = articles[i].urlToImage;
                        let search_text = next_child.getElementsByClassName("searchText")[0];
                        search_text.getElementsByClassName("searchTitle")[0].innerHTML = articles[i].title;
                        search_text.getElementsByClassName("searchDescription")[0].innerHTML = articles[i].description;
                        search_text.getElementsByClassName("shortDescription")[0].innerHTML = getShortDesciption(articles[i].description);
                        search_text.getElementsByClassName("searchLink")[0].href = articles[i].url;
                        search_text.getElementsByClassName("searchSource")[0].innerHTML = "<b>Source:</b>"  + "&nbsp;&nbsp;" +  articles[i].source.name;
                        var datetime = new Date(articles[i].publishedAt);
                        var day = String(datetime.getDate()).padStart(2, '0');
                        var month = String(datetime.getMonth() + 1).padStart(2, '0'); //January is 0!
                        var year = datetime.getFullYear();
                        var search_date = month + '/' + day + '/' + year;
                        search_text.getElementsByClassName("searchDate")[0].innerHTML = "<b>Date:</b>"  + "&nbsp;&nbsp;" +  search_date;
                        search_text.getElementsByClassName("searchAuthor")[0].innerHTML = "<b>Author:</b>" + "&nbsp;&nbsp;" +  articles[i].author;
                        next_child.style.display = "block";
                        if(i<5)
                            initial_element.appendChild(next_child);
                        else
                            final_element.appendChild(next_child);
                    }  

                    if(total_length > 5){
                      
                        document.getElementById("showButton").value = "Show More";
                        document.getElementById("showButton").innerHTML = "Show More";
                        document.getElementById("showButton").style.display = "block";
                    }
                }
            }
            else if(data.errorNote){
                alert(data.errorNote);
                return false;
            }
        }


        function getShortDesciption(description){
            let limit = 73;
            if(description.length <= 76)
                return description;
            else{
                shortDescription = description.substr(0,limit);
                let index = shortDescription.lastIndexOf(' ');
                shortDescription = shortDescription.substr(0,index) + "...";
                return shortDescription;
            }
        }

        function buttonClick(){
            if(show == false){
                show = true;
                document.getElementById("showButton").value = "Show Less";
                document.getElementById("showButton").innerHTML = "Show Less";
                document.getElementsByClassName("final-articles")[0].style.display = "block";
            }
            else if(show == true){
                show = false;
                document.getElementsByClassName("final-articles")[0].style.display = "none";
                document.getElementById("showButton").value = "Show More";
                document.getElementById("showButton").innerHTML = "Show More";
            }
        }
