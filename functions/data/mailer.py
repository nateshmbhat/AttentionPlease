import smtplib ; 
import os ,sys ; 
obj = smtplib.SMTP('smtp.gmail.com' , 587) ; 
obj.starttls() ; 
obj.login('notifytosit@gmail.com' , 'workisworship_sit') ; 
obj.sendmail('notifytosit@gmail.com' , sys.argv[1] , sys.argv[2]) ;
