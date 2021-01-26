import string
#import sys
#import csv

# open csv file...in read mode
inFile= open("data_COM18_M_Z.csv", 'r')
outFile= open("data_COM18_M_Z.txt", 'w')



for line in inFile:
    lineList = line.split(',') # Really, you should use csv reader
    #print lineList[0]
# Open the file to write to
    with open("data_COM18_M_Z.txt", 'w') as outFile:
        # iterate through the line
        for index, value in enumerate(lineList):
            s= lineList[index]
            print s.strip()
            #if index % 1 == 0 and index != 0:
            # Write the last 10 values to the file, separated by space
            #outFile.write('\t'.join(lineList[index-0:index]))
            outFile.write("\t".join(s))
            # new line
            outFile.write('\n')
            # print
            #print lineList[index:index]

outFile.close()
inFile.close()