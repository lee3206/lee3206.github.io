/* 
author: Paul May, 6/23/18
*/


 function highlightIndex (index,ratio,numVotes)
 {
    field = document.getElementById(index);
    if(numVotes > 0.66){
        numVotes = 0.75;
    }else if(numVotes > 0.33){
        numVotes = 0.33;
    }else if(numVotes > 0.25){
        numVotes = 0.25;
    }else if(numVotes > 0.10){
        numVotes = 0.0;
    }

    if (field != null)
    {

        if(ratio > 0.5){
            ratio = 1;
        }else{
            ratio = 0;
        }
        field.style.backgroundColor = 'hsla('+parseInt(120*ratio)+',50%,55%,'+numVotes*0.75+')';
    }
    else
    {
    }
 }

 function unhiglight (index)
 {
    field = document.getElementById(index);
    field.style.backgroundColor = 'white';
 }

var results;
 
 function loadCSV (undo) 
 {
    Papa.parse('/static/mturk.csv', 
    {
        download: true,
        complete: function(results) 
        {
            //worth noting, filename is injected into the html file at the top
            //this happens in launch_tasks.py under generate_heat_maps
            // the csv parse does not support labeling so:
            // in results[i]
            // [0] is docname , [1] is asg id , [2] is worker id , [3] sentiment , [4] is comma seperated data
            indexRatios = {};
            index_counter = {};
            //in the future this filter may change to reflect file splitting
            results = results['data'].filter(line => line[0] == filename);

            //filter down to relevent file
            for(i=0; i<results.length; i++){
                
                if (results[i][4] == ""){continue;}

                lip = results[i][4].split(',');
                //lip is the list of all indices voted on by a particular user
                
                sentiment = results[i][3];



                for(j=0; j<lip.length; j++){
                    vote_index = lip[j].trim();

                    if(index_counter.hasOwnProperty(vote_index))
                    {
                        index_counter[vote_index]++;
                    }
                    else
                    {
                        index_counter[vote_index] = 1;
                    }
    

                    if(indexRatios.hasOwnProperty(vote_index))
                    {
                        posi_count = indexRatios[vote_index][1];
                        negat_count = indexRatios[vote_index][0];

                            if(sentiment == 'positive')
                            {
                            indexRatios[vote_index] = [negat_count,posi_count+1];
                            }
                            else
                            {
                            indexRatios[vote_index] = [negat_count+1,posi_count];
                            }
                    }
                    else
                    {
                        if(sentiment == 'positive')
                        {
                        indexRatios[vote_index] = [0,1];
                        }
                        else
                        {
                        indexRatios[vote_index] = [1,0];
                        }
                    }

                }

            }


            for(index in indexRatios)
            {
                posi_count = indexRatios[index][1];
                negat_count = indexRatios[index][0];
                ratio = posi_count/(negat_count+posi_count);
                numVotes = (posi_count+negat_count)/(results.length/2);
                //numVotes = (posi_count+negat_count)/results.length;
                field = document.getElementById(index)
                field.title = "Pos: "+posi_count+", Neg: "+negat_count+", response ratio : "+(posi_count+negat_count)+" out of "+results.length/2;
                if(undo)
                {
                   unhiglight(index);
                }
                else
                {
                    highlightIndex(index,ratio,numVotes);
                }
            }

        }
    });
 };
