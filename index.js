import {S3Client, GetObjectCommand, PutObjectCommand} from '@aws-sdk/client-s3';

export const handler = async(e) => {

const s3Client = new S3Client({region: "us-west-2"});

const bucket = "chrislopez-image";

const s3SummaryParams = {
        Bucket: bucket, 
        Key: "summary.json"
    };



    console.log("handler event", JSON.stringify(e, undefined, " "));
    const imageUploaded = e.Records[0].s3.object.key;
    
    
    //GetObject{bucket}/summary.json
    let summaryJson;
    try{
        summaryJson = await s3Client.send(new GetObjectCommand(s3SummaryParams));
    } catch (e){
        console.warn("error getting summary.json", e);
        summaryJson = "[]";
    }
    const summary = JSON.parse(summaryJson);
    
    //Append new file to summary
    
    summary.push(imageUploaded); 
    

    
    const updatedSummaryJson = JSON.stringify(summary, undefined, " ");
    console.log("updated summary JSON", updatedSummaryJson);
    
    try{
    await s3Client.send(new PutObjectCommand({
       ...s3SummaryParams,
        Body: updatedSummaryJson,
        ContentType: "application/json"  //For JSON, it's always this content type
    }));
    } catch (e) {
        console.warn('Failed to put summary', e);
    }
    
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "updated summary.json",
            summary
        })
    };
};