---
layout: default
title:  "Select2Query Feedback"
date:   2023-05-13 12:00:00 -0500
categories: QUERY
---



## Post Feedback


<form 
  id="select2queryfeedback-form"
  method="POST" 
  action="https://script.google.com/macros/s/AKfycbwsoqs0cFeBCpiMsX5Eo8syGQJNIEOj-fq7hy7N5-XzCpLMNrDYUlYAku7OMKojNxfi/exec"  
>
  <label for="eMail"><b>eMail address </b>(optional)</label><br>
  <input name="eMail" type="email" placeholder="eMail" >

  <br>
  <label for="Name"><b>Contact name or handle </b>(optional)</label><br>
  <input name="Name" type="text" placeholder="Name" >

  <br><br>
  <label for="Comment"><b>Comment on Select2Query </b>(required)</label>
  <textarea id="Comment" name="Comment" rows="5" cols="60" placeholder="Comment" required></textarea>
  <br><br>

  <input type="hidden" name="Project" value="Select2Query" />

  <button type="submit">Send</button>

   <script src="{{ '/assets/js/Web2QueryFeedback.js' | relative_url }}"></script>
</form>

<br>


## Previous Feedback


<table>

      <thead>
         <tr id="data-header">
            <!-- Table header columns from javascript file in here. -->
         </tr>
      </thead>
      <tbody id="data-output">
         <!-- Comments from javascript file in here. -->
      </tbody>
 
</table>



