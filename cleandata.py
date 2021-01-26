import string
#import sys
import codecs
import csv

# open csv file...in read mode
#inFile= open("data_COM18_M_Z.csv", "rb", "utf-16")
outFile= open("data_COM18_M_Z.txt", 'wb')

f=codecs.open("data_COM18_M_Z.csv","rb","utf-16")


reader = csv.reader(f, delimiter=',')
for row in reader:
    #lineList = line.split(',') # Really, you should use csv reader
# Open the file to write to
    for vals in row:
        with open("data_COM18_M_Z.txt", 'a') as outFile:
            # iterate through the line
            #s= lineList)
            print(vals)
        #print s.replace(" ", "_")
        #if index % 1 == 0 and index != 0:
        # Write the last 10 values to the file, separated by space
        #outFile.write('\t'.join(lineList[index-0:index]))
            outFile.write(vals)
        # new line
            outFile.write('\n')
        # print
        #print lineList[index:index]

outFile.close()
f.close()