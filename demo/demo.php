<?php
  # Note: this simple php file is just for testing. Please don't use it in production.
  #       You should write more for production.

  $fontSize = $_POST['fontSize'];
  $userId = $_POST['userId'];
  $mode = $_POST['mode'];
  $color = $_POST['color'];
  $message = $_POST['message'];
  $playTime = $_POST['playTime'];
  $date = $_POST['date'];

  $db_conn = new mysqli('hostname', 'username', 'password', 'databasename', 3306);

  if(!!$fontSize && !!$userId && !!$mode && !!$color && !!$message && !!$date) {
    $query = "insert into databasename.tablename (fontSize, userId, mode, color, message, playTime, date) values('".$fontSize."', '".$userId."', '".$mode."', '".$color."', '".$message."', ".$playTime.", '".$date."')";

    $result = $db_conn->query($query);

    if(!$result) {
      $return_data = array( 'sendSuccess' => false,
                        'bulletScreenContent' => array()
                     );
    }
    else {
      $query = "select * from databasename.tablename order by playTime";
      $result = $db_conn->query($query);

      for($i = 0; $i < $result->num_rows; $i++) {
          $row = $result->fetch_assoc();
          $array_list[] = array(
                        'fontSize' => $row['fontSize'],
                        'userId' => $row['userId'],
                        'mode' => $row['mode'], 
                        'color' => $row['color'], 
                        'message' => $row['message'],
                        'playTime' => $row['playTime'],
                        'date' => $row['date']
                     );
      }

      $return_data = array( 'sendSuccess' => true,
                        'bulletScreenContent' => $array_list
                     );
    }
  }
  else {
    $query = "select * from databasename.tablename order by playTime";
    $result = $db_conn->query($query);

    for($i = 0; $i < $result->num_rows; $i++) {
        $row = $result->fetch_assoc();
        $array_list[] = array(
                      'fontSize' => $row['fontSize'],
                      'userId' => $row['userId'],
                      'mode' => $row['mode'], 
                      'color' => $row['color'], 
                      'message' => $row['message'],
                      'playTime' => $row['playTime'],
                      'date' => $row['date']
                   );
    }

    $return_data = array( 'sendSuccess' => true,
                      'bulletScreenContent' => $array_list
                   );
  }

  echo json_encode($return_data);

  # the bottom of this php file
